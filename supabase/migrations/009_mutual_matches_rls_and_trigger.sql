-- ============================================================================
-- Two Birds Migration 009: Fix Mutual Matches & Swipes RLS + Automatic Trigger
-- ============================================================================

-- 1. Ensure matches table exists with required columns and constraints
create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  user_a uuid references auth.users(id) on delete cascade not null,
  user_b uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_activity timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_a, user_b)
);

create index if not exists idx_matches_users on public.matches(user_a, user_b);
alter table public.matches enable row level security;

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

-- 4. AUTOMATIC MUTUAL MATCH CREATION TRIGGER
-- When a user likes someone who already liked them, automatically create a match row in public.matches
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
    -- Consistently order user IDs (user_a < user_b)
    if new.swiper_id < new.swiped_id then
      u_a := new.swiper_id;
      u_b := new.swiped_id;
    else
      u_a := new.swiped_id;
      u_b := new.swiper_id;
    end if;

    -- Insert match if not already existing
    insert into public.matches (user_a, user_b, created_at, last_activity)
    values (u_a, u_b, timezone('utc'::text, now()), timezone('utc'::text, now()))
    on conflict (user_a, user_b) do nothing;
  end if;

  return new;
exception
  when others then
    -- Never abort the swipe insert even if match trigger encounters an error
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_swipe_create_mutual_match on public.swipes;
create trigger on_swipe_create_mutual_match
  after insert on public.swipes
  for each row execute function public.handle_mutual_swipe_match();
