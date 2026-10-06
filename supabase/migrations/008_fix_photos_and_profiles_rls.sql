-- ============================================================================
-- Two Birds Migration 008: Profiles & Storage Photos Persistence Fix
-- ============================================================================

-- 1. Ensure storage bucket exists and is public
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do update set public = true;

-- Storage RLS: Public read
drop policy if exists "Public photo viewing" on storage.objects;
create policy "Public photo viewing"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

-- Storage RLS: Users upload only to own user folder
drop policy if exists "Users can upload photos to own folder" on storage.objects;
create policy "Users can upload photos to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: Users update photos in own folder
drop policy if exists "Users can update photos in own folder" on storage.objects;
create policy "Users can update photos in own folder"
  on storage.objects for update
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: Users delete photos in own folder
drop policy if exists "Users can delete photos in own folder" on storage.objects;
create policy "Users can delete photos in own folder"
  on storage.objects for delete
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2. Ensure profiles table and columns exist
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Student',
  email text not null default '',
  age integer default 20,
  gender text default 'Other',
  major text default 'Undecided',
  university text not null default 'University of Ghana (UG)',
  bio text default '',
  photos text[] default '{}'::text[],
  interests text[] default '{}'::text[],
  verified_campus boolean default true,
  is_premium boolean default false,
  preferred_gender text default 'Everyone',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist if table was already created
alter table public.profiles add column if not exists photos text[] default '{}'::text[];
alter table public.profiles add column if not exists is_premium boolean default false;
alter table public.profiles add column if not exists preferred_gender text default 'Everyone';

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles RLS: Authenticated students can view all profiles
drop policy if exists "Authenticated students can view profiles" on public.profiles;
create policy "Authenticated students can view profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Profiles RLS: Users can insert their own profile
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Profiles RLS: Users can update their own profile
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Automatic Profile Creation Trigger on auth.users
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  insert into public.profiles (
    id, email, name, university, major, age, gender, photos, interests
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', 'Student'),
    coalesce(new.raw_user_meta_data->>'university', 'University of Ghana (UG)'),
    coalesce(new.raw_user_meta_data->>'major', 'Undecided'),
    coalesce((new.raw_user_meta_data->>'age')::integer, 20),
    coalesce(new.raw_user_meta_data->>'gender', 'Other'),
    '{}'::text[],
    array['Campus Life', 'Coffee', 'Study Groups']
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();
