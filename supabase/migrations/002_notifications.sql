-- Phase 6.2: Notifications & Preferences Migration
-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- NOTIFICATIONS TABLE
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

-- NOTIFICATION PREFERENCES TABLE
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  push_enabled boolean default true not null,
  matches_enabled boolean default true not null,
  messages_enabled boolean default true not null,
  likes_enabled boolean default true not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INDEXES
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

-- ENABLE ROW LEVEL SECURITY
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

-- RLS POLICIES: NOTIFICATIONS
create policy "Users can select own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

-- RLS POLICIES: NOTIFICATION PREFERENCES
create policy "Users can select own notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own notification preferences"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id);
