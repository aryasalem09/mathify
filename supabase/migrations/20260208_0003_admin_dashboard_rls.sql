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

alter table public.profiles
  add column if not exists email text,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists updated_at timestamp with time zone not null default now();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, email)
  values (new.id, 'student', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date date,
  type text not null,
  problem_ids integer[] not null default '{}',
  assigned_to text not null default 'all',
  assigned_user_ids uuid[],
  created_by uuid references auth.users,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  assignment_id uuid references public.assignments on delete set null,
  problem_id integer,
  code text,
  output text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.submissions on delete cascade,
  assignment_id uuid references public.assignments on delete set null,
  problem_id integer,
  user_id uuid not null references auth.users on delete cascade,
  score numeric,
  feedback text,
  graded_by uuid references auth.users on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.assignments
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists due_date date,
  add column if not exists type text,
  add column if not exists problem_ids integer[] default '{}',
  add column if not exists assigned_to text default 'all',
  add column if not exists assigned_user_ids uuid[],
  add column if not exists created_by uuid,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists updated_at timestamp with time zone not null default now();

alter table public.submissions
  add column if not exists user_id uuid,
  add column if not exists assignment_id uuid,
  add column if not exists problem_id integer,
  add column if not exists code text,
  add column if not exists output text,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists updated_at timestamp with time zone not null default now();

alter table public.grades
  add column if not exists submission_id uuid,
  add column if not exists assignment_id uuid,
  add column if not exists problem_id integer,
  add column if not exists user_id uuid,
  add column if not exists score numeric,
  add column if not exists feedback text,
  add column if not exists graded_by uuid,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists updated_at timestamp with time zone not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.assignments'::regclass and contype = 'p'
  ) then
    alter table public.assignments add constraint assignments_pkey primary key (id);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.submissions'::regclass and contype = 'p'
  ) then
    alter table public.submissions add constraint submissions_pkey primary key (id);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.grades'::regclass and contype = 'p'
  ) then
    alter table public.grades add constraint grades_pkey primary key (id);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'submissions_user_id_fkey') then
    alter table public.submissions
      add constraint submissions_user_id_fkey
      foreign key (user_id) references auth.users on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'submissions_assignment_id_fkey') then
    alter table public.submissions
      add constraint submissions_assignment_id_fkey
      foreign key (assignment_id) references public.assignments on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'grades_submission_id_fkey') then
    alter table public.grades
      add constraint grades_submission_id_fkey
      foreign key (submission_id) references public.submissions on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'grades_assignment_id_fkey') then
    alter table public.grades
      add constraint grades_assignment_id_fkey
      foreign key (assignment_id) references public.assignments on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'grades_user_id_fkey') then
    alter table public.grades
      add constraint grades_user_id_fkey
      foreign key (user_id) references auth.users on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'grades_graded_by_fkey') then
    alter table public.grades
      add constraint grades_graded_by_fkey
      foreign key (graded_by) references auth.users on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'assignments_created_by_fkey') then
    alter table public.assignments
      add constraint assignments_created_by_fkey
      foreign key (created_by) references auth.users on delete set null;
  end if;
end $$;

create unique index if not exists grades_submission_unique
  on public.grades (submission_id);

drop trigger if exists set_assignments_updated_at on public.assignments;
create trigger set_assignments_updated_at
  before update on public.assignments
  for each row execute function public.set_updated_at();

drop trigger if exists set_submissions_updated_at on public.submissions;
create trigger set_submissions_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

drop trigger if exists set_grades_updated_at on public.grades;
create trigger set_grades_updated_at
  before update on public.grades
  for each row execute function public.set_updated_at();

alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.grades enable row level security;

drop policy if exists "Admins can manage assignments" on public.assignments;
drop policy if exists "Students can read assigned assignments" on public.assignments;

drop policy if exists "Admins can manage submissions" on public.submissions;
drop policy if exists "Students can read own submissions" on public.submissions;
drop policy if exists "Students can insert own submissions" on public.submissions;
drop policy if exists "Students can update own submissions" on public.submissions;

drop policy if exists "Admins can manage grades" on public.grades;
drop policy if exists "Students can read own grades" on public.grades;

create policy "Admins can manage assignments"
  on public.assignments
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Students can read assigned assignments"
  on public.assignments
  for select
  using (
    assigned_to = 'all'
    or (assigned_to = 'selected' and auth.uid() = any(assigned_user_ids))
  );

create policy "Admins can manage submissions"
  on public.submissions
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Students can read own submissions"
  on public.submissions
  for select
  using (auth.uid() = user_id);

create policy "Students can insert own submissions"
  on public.submissions
  for insert
  with check (
    auth.uid() = user_id
    and (
      assignment_id is null
      or exists (
        select 1
        from public.assignments a
        where a.id = assignment_id
          and (
            a.assigned_to = 'all'
            or (a.assigned_to = 'selected' and auth.uid() = any(a.assigned_user_ids))
          )
      )
    )
  );

create policy "Students can update own submissions"
  on public.submissions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage grades"
  on public.grades
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Students can read own grades"
  on public.grades
  for select
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
