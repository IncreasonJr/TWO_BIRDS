-- ============================================================================
-- Two Birds - Migration 004: Expand University Email Validation (.edu & .edu.gh)
-- ============================================================================
-- Description:
-- Updates the server-side validation trigger on auth.users so that registration
-- is permitted for both standard .edu addresses and Ghanaian university addresses
-- ending in .edu.gh (e.g. ug.edu.gh, knust.edu.gh), case-insensitively.
-- ============================================================================

-- Replace validation function to allow .edu and .edu.gh domains
create or replace function public.enforce_edu_email_check()
returns trigger as $$
begin
  if new.email is not null and (new.email not ilike '%.edu' and new.email not ilike '%.edu.gh') then
    raise exception 'Registration is strictly limited to verified university (.edu or .edu.gh) email addresses.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger on auth.users for both insert and update of email
drop trigger if exists tr_enforce_edu_email on auth.users;
create trigger tr_enforce_edu_email
  before insert or update of email on auth.users
  for each row execute function public.enforce_edu_email_check();
