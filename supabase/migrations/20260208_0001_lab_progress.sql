create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'student',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.user_lab_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  lab_id text not null,
  problem_id text not null,
  status text not null,
  score numeric,
  updated_at timestamp with time zone not null default now()
);

create unique index if not exists user_lab_progress_unique
  on public.user_lab_progress (user_id, lab_id, problem_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_user_lab_progress_updated_at
before update on public.user_lab_progress
for each row execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_lab_progress enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Admins can view profiles"
  on public.profiles
  for select
  using (public.is_admin());

create policy "Profiles can be inserted by owner"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Profiles can be updated by owner (no role changes)"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (
      select p.role from public.profiles p where p.id = auth.uid()
    )
  );

create policy "Admins can update profiles"
  on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can read own lab progress"
  on public.user_lab_progress
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own lab progress"
  on public.user_lab_progress
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lab progress"
  on public.user_lab_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own lab progress"
  on public.user_lab_progress
  for delete
  using (auth.uid() = user_id);
