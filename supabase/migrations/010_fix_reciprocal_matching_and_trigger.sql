-- ============================================================================
-- Two Birds Migration 010: Fix Mutual Matching, Reciprocal Swipes & Backfill
-- ============================================================================

-- 1. Ensure matches table exists
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references auth.users(id) on delete cascade not null,
  user_b uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crucial: Explicitly add missing columns to public.matches if table was already created
alter table public.matches add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());
alter table public.matches add column if not exists last_activity timestamp with time zone default timezone('utc'::text, now());

-- Deduplicate any existing duplicate matches before creating unique index
delete from public.matches m1
using public.matches m2
where m1.user_a = m2.user_a
  and m1.user_b = m2.user_b
  and m1.id <> m2.id
  and m1.created_at < m2.created_at;

-- Ensure unique index exists on (user_a, user_b) for ON CONFLICT resolution
create unique index if not exists idx_matches_user_a_user_b_unique on public.matches (user_a, user_b);

-- Ensure RLS is active
alter table public.matches enable row level security;
alter table public.swipes enable row level security;

-- 2. FIX SWIPES RLS POLICIES
-- Critical: Users must be able to view swipes where they are either swiper_id OR swiped_id,
-- otherwise client-side checkForMatch() cannot detect reciprocal likes!
drop policy if exists "Users can view their own swipes" on public.swipes;
create policy "Users can view their own swipes"
  on public.swipes for select
  to authenticated
  using (auth.uid() = swiper_id or auth.uid() = swiped_id);

drop policy if exists "Users can record their own swipes" on public.swipes;
create policy "Users can record their own swipes"
  on public.swipes for insert
  to authenticated
  with check (auth.uid() = swiper_id);

drop policy if exists "Users can update their own swipes" on public.swipes;
create policy "Users can update their own swipes"
  on public.swipes for update
  to authenticated
  using (auth.uid() = swiper_id)
  with check (auth.uid() = swiper_id);

drop policy if exists "Users can delete their own swipes" on public.swipes;
create policy "Users can delete their own swipes"
  on public.swipes for delete
  to authenticated
  using (auth.uid() = swiper_id);

-- 3. FIX MATCHES RLS POLICIES
-- Ensure authenticated users can select, insert, update, and delete matches where they are a participant
drop policy if exists "Users can view their own matches" on public.matches;
create policy "Users can view their own matches"
  on public.matches for select
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can insert mutual matches" on public.matches;
create policy "Users can insert mutual matches"
  on public.matches for insert
  to authenticated
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can update their own matches" on public.matches;
create policy "Users can update their own matches"
  on public.matches for update
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b)
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can delete their own matches" on public.matches;
create policy "Users can delete their own matches"
  on public.matches for delete
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

-- 4. ATOMIC MUTUAL MATCH RPC FUNCTION (Bypasses RLS safely with SECURITY DEFINER)
create or replace function public.check_and_create_mutual_match(
  p_swiper_id uuid,
  p_swiped_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  u_a uuid;
  u_b uuid;
  m_row public.matches%rowtype;
  is_mutual boolean := false;
begin
  -- Consistently order user IDs (u_a < u_b)
  if p_swiper_id < p_swiped_id then
    u_a := p_swiper_id;
    u_b := p_swiped_id;
  else
    u_a := p_swiped_id;
    u_b := p_swiper_id;
  end if;

  -- Check if reciprocal like exists
  select exists (
    select 1 from public.swipes
    where swiper_id = p_swiped_id
      and swiped_id = p_swiper_id
      and direction = 'like'
  ) into is_mutual;

  if not is_mutual then
    return jsonb_build_object('is_match', false);
  end if;

  -- Mutual match confirmed! Insert or update existing match
  insert into public.matches (user_a, user_b, created_at, last_activity)
  values (u_a, u_b, timezone('utc'::text, now()), timezone('utc'::text, now()))
  on conflict (user_a, user_b) do update
    set last_activity = timezone('utc'::text, now())
  returning * into m_row;

  return jsonb_build_object(
    'is_match', true,
    'match_id', m_row.id,
    'user_a', m_row.user_a,
    'user_b', m_row.user_b,
    'created_at', m_row.created_at
  );
end;
$$;

grant execute on function public.check_and_create_mutual_match(uuid, uuid) to authenticated, anon;

-- 5. AUTOMATIC MUTUAL MATCH TRIGGER ON SWIPES (Runs on INSERT OR UPDATE)
create or replace function public.handle_mutual_swipe_match()
returns trigger as $$
declare
  u_a uuid;
  u_b uuid;
begin
  -- Only trigger on likes
  if new.direction <> 'like' then
    return new;
  end if;

  -- Check if reciprocal like exists
  if exists (
    select 1 from public.swipes
    where swiper_id = new.swiped_id
      and swiped_id = new.swiper_id
      and direction = 'like'
  ) then
    if new.swiper_id < new.swiped_id then
      u_a := new.swiper_id;
      u_b := new.swiped_id;
    else
      u_a := new.swiped_id;
      u_b := new.swiper_id;
    end if;

    insert into public.matches (user_a, user_b, created_at, last_activity)
    values (u_a, u_b, timezone('utc'::text, now()), timezone('utc'::text, now()))
    on conflict (user_a, user_b) do update
      set last_activity = timezone('utc'::text, now());
  end if;

  return new;
exception
  when others then
    return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists on_swipe_create_mutual_match on public.swipes;
create trigger on_swipe_create_mutual_match
  after insert or update on public.swipes
  for each row execute function public.handle_mutual_swipe_match();

-- 6. BACKFILL EXISTING MUTUAL LIKES INTO MATCHES TABLE
-- Immediately converts any existing mutual likes in swipes table into matches
insert into public.matches (user_a, user_b, created_at, last_activity)
select
  least(s1.swiper_id, s1.swiped_id) as user_a,
  greatest(s1.swiper_id, s1.swiped_id) as user_b,
  timezone('utc'::text, now()),
  timezone('utc'::text, now())
from public.swipes s1
join public.swipes s2
  on s1.swiper_id = s2.swiped_id
 and s1.swiped_id = s2.swiper_id
where s1.direction = 'like'
  and s2.direction = 'like'
  and s1.swiper_id < s1.swiped_id
on conflict (user_a, user_b) do update
  set last_activity = timezone('utc'::text, now());
