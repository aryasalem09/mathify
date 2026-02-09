-- Prevent self-escalation; profiles are created by trigger and updated by admins only.
drop policy if exists "Profiles can be inserted by owner" on public.profiles;
drop policy if exists "Profiles can be updated by owner (no role changes)" on public.profiles;
