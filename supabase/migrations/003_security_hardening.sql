-- Phase 7: Complete Security Hardening & Master RLS Policies
-- Enables RLS across all 8 tables, restricts storage object mutations to user folders,
-- and adds server-side triggers for .edu email enforcement and minimum age requirements.

create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. TABLE STRUCTURES (ENSURE ALL EXIST & CONSTRAINTS ENFORCED)
-- ============================================================================

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  age integer default 20,
  gender text default 'Other',
  major text default 'Undecided',
  university text not null default 'Stanford University',
  bio text default '',
  photos text[] default '{}'::text[],
  interests text[] default '{}'::text[],
  verified_campus boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure age >= 18 constraint
alter table public.profiles drop constraint if exists check_minimum_age;
alter table public.profiles add constraint check_minimum_age check (age >= 18);

-- SWIPES
create table if not exists public.swipes (
  id uuid primary key default uuid_generate_v4(),
  swiper_id uuid references auth.users(id) on delete cascade not null,
  swiped_id uuid references auth.users(id) on delete cascade not null,
  direction text not null check (direction in ('like', 'pass', 'superlike')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(swiper_id, swiped_id)
);

-- MATCHES
create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  user_a uuid references auth.users(id) on delete cascade not null,
  user_b uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_activity timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_a, user_b)
);

-- MESSAGES
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  message_type text default 'text',
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REPORTS
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references auth.users(id) on delete cascade not null,
  reported_id uuid references auth.users(id) on delete cascade not null,
  reason text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BLOCKS
create table if not exists public.blocks (
  id uuid primary key default uuid_generate_v4(),
  blocker_id uuid references auth.users(id) on delete cascade not null,
  blocked_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(blocker_id, blocked_id)
);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('match', 'message', 'like', 'system')),
  title text not null,
  body text not null,
  data jsonb default '{}'::jsonb,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTIFICATION PREFERENCES
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  push_enabled boolean default true not null,
  matches_enabled boolean default true not null,
  messages_enabled boolean default true not null,
  likes_enabled boolean default true not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- 2. INDEXES FOR HIGH QUERY PERFORMANCE & RLS FILTERING
-- ============================================================================
create index if not exists idx_profiles_university on public.profiles(university);
create index if not exists idx_swipes_swiper_id on public.swipes(swiper_id);
create index if not exists idx_swipes_swiped_id on public.swipes(swiped_id);
create index if not exists idx_matches_users on public.matches(user_a, user_b);
create index if not exists idx_messages_match_id on public.messages(match_id);
create index if not exists idx_messages_created_at on public.messages(created_at asc);
create index if not exists idx_reports_reporter on public.reports(reporter_id);
create index if not exists idx_blocks_blocker on public.blocks(blocker_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_unread on public.notifications(user_id, is_read);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) ENFORCEMENT ACROSS ALL 8 TABLES
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

-- PROFILES POLICIES
drop policy if exists "Authenticated students can view profiles" on public.profiles;
create policy "Authenticated students can view profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- SWIPES POLICIES
drop policy if exists "Users can view their own swipes" on public.swipes;
create policy "Users can view their own swipes"
  on public.swipes for select
  using (auth.uid() = swiper_id);

drop policy if exists "Users can record their own swipes" on public.swipes;
create policy "Users can record their own swipes"
  on public.swipes for insert
  with check (auth.uid() = swiper_id);

drop policy if exists "Users can delete their own swipes" on public.swipes;
create policy "Users can delete their own swipes"
  on public.swipes for delete
  using (auth.uid() = swiper_id);

-- MATCHES POLICIES
drop policy if exists "Users can view their own matches" on public.matches;
create policy "Users can view their own matches"
  on public.matches for select
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can insert mutual matches" on public.matches;
create policy "Users can insert mutual matches"
  on public.matches for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can update their own matches" on public.matches;
create policy "Users can update their own matches"
  on public.matches for update
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can delete their own matches" on public.matches;
create policy "Users can delete their own matches"
  on public.matches for delete
  using (auth.uid() = user_a or auth.uid() = user_b);

-- MESSAGES POLICIES
drop policy if exists "Match participants can read messages" on public.messages;
create policy "Match participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

drop policy if exists "Match participants can send messages" on public.messages;
create policy "Match participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

drop policy if exists "Match participants can mark messages read" on public.messages;
create policy "Match participants can mark messages read"
  on public.messages for update
  using (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

drop policy if exists "Sender can delete own messages" on public.messages;
create policy "Sender can delete own messages"
  on public.messages for delete
  using (auth.uid() = sender_id);

-- REPORTS POLICIES
drop policy if exists "Users can view their submitted reports" on public.reports;
create policy "Users can view their submitted reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

drop policy if exists "Users can submit reports" on public.reports;
create policy "Users can submit reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "Users can delete their submitted reports" on public.reports;
create policy "Users can delete their submitted reports"
  on public.reports for delete
  using (auth.uid() = reporter_id);

-- BLOCKS POLICIES
drop policy if exists "Users can view their own blocks" on public.blocks;
create policy "Users can view their own blocks"
  on public.blocks for select
  using (auth.uid() = blocker_id);

drop policy if exists "Users can block other users" on public.blocks;
create policy "Users can block other users"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

drop policy if exists "Users can unblock users" on public.blocks;
create policy "Users can unblock users"
  on public.blocks for delete
  using (auth.uid() = blocker_id);

-- NOTIFICATIONS POLICIES
drop policy if exists "Users can select own notifications" on public.notifications;
create policy "Users can select own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

drop policy if exists "Authenticated users can insert notifications" on public.notifications;
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

-- NOTIFICATION PREFERENCES POLICIES
drop policy if exists "Users can select own notification preferences" on public.notification_preferences;
create policy "Users can select own notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own notification preferences" on public.notification_preferences;
create policy "Users can insert own notification preferences"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own notification preferences" on public.notification_preferences;
create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id);

-- ============================================================================
-- 4. STORAGE POLICIES (PROFILE-PHOTOS BUCKET)
-- ============================================================================
-- Ensure bucket exists and is public for reading
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do update set public = true;

-- Public can view profile photos
drop policy if exists "Public photo viewing" on storage.objects;
create policy "Public photo viewing"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

-- Users can only upload photos to their own user folder
drop policy if exists "Users can upload photos to own folder" on storage.objects;
create policy "Users can upload photos to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only update photos in their own user folder
drop policy if exists "Users can update photos in own folder" on storage.objects;
create policy "Users can update photos in own folder"
  on storage.objects for update
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only delete photos in their own user folder
drop policy if exists "Users can delete photos in own folder" on storage.objects;
create policy "Users can delete photos in own folder"
  on storage.objects for delete
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 5. SERVER-SIDE .EDU EMAIL VALIDATION TRIGGER ON AUTH.USERS
-- ============================================================================
create or replace function public.enforce_edu_email_check()
returns trigger as $$
begin
  if new.email is not null and new.email not ilike '%.edu' then
    raise exception 'Registration is strictly limited to verified university (.edu) email addresses.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_enforce_edu_email on auth.users;
create trigger tr_enforce_edu_email
  before insert or update of email on auth.users
  for each row execute function public.enforce_edu_email_check();
