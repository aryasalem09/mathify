-- Approval gate for pending users and stricter RLS policies.

create or replace function public.is_approved()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('student', 'admin')
  );
$$;

alter table public.profiles
  alter column role set default 'pending';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, email)
  values (new.id, 'pending', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.grades enable row level security;
alter table public.user_lab_progress enable row level security;

-- assignments

drop policy if exists "Admins can manage assignments" on public.assignments;
drop policy if exists "Students can read assigned assignments" on public.assignments;

drop policy if exists "Admins can read assignments" on public.assignments;
drop policy if exists "Admins can insert assignments" on public.assignments;
drop policy if exists "Admins can update assignments" on public.assignments;
drop policy if exists "Admins can delete assignments" on public.assignments;
drop policy if exists "Approved students can read assigned assignments" on public.assignments;

create policy "Admins can read assignments"
  on public.assignments
  for select
  using (public.is_admin());

create policy "Admins can insert assignments"
  on public.assignments
  for insert
  with check (public.is_admin());

create policy "Admins can update assignments"
  on public.assignments
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete assignments"
  on public.assignments
  for delete
  using (public.is_admin());

create policy "Approved students can read assigned assignments"
  on public.assignments
  for select
  using (
    public.is_approved()
    and (
      assigned_to = 'all'
      or (assigned_to = 'selected' and auth.uid() = any(assigned_user_ids))
    )
  );

-- submissions

drop policy if exists "Admins can manage submissions" on public.submissions;
drop policy if exists "Students can read own submissions" on public.submissions;
drop policy if exists "Students can insert own submissions" on public.submissions;
drop policy if exists "Students can update own submissions" on public.submissions;

drop policy if exists "Admins can read submissions" on public.submissions;
drop policy if exists "Admins can insert submissions" on public.submissions;
drop policy if exists "Admins can update submissions" on public.submissions;
drop policy if exists "Admins can delete submissions" on public.submissions;
drop policy if exists "Approved students can read own submissions" on public.submissions;
drop policy if exists "Approved students can insert own submissions" on public.submissions;
drop policy if exists "Approved students can update own submissions" on public.submissions;

create policy "Admins can read submissions"
  on public.submissions
  for select
  using (public.is_admin());

create policy "Admins can insert submissions"
  on public.submissions
  for insert
  with check (public.is_admin());

create policy "Admins can update submissions"
  on public.submissions
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete submissions"
  on public.submissions
  for delete
  using (public.is_admin());

create policy "Approved students can read own submissions"
  on public.submissions
  for select
  using (public.is_approved() and auth.uid() = user_id);

create policy "Approved students can insert own submissions"
  on public.submissions
  for insert
  with check (
    public.is_approved()
    and auth.uid() = user_id
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

create policy "Approved students can update own submissions"
  on public.submissions
  for update
  using (public.is_approved() and auth.uid() = user_id)
  with check (public.is_approved() and auth.uid() = user_id);

-- grades

drop policy if exists "Admins can manage grades" on public.grades;
drop policy if exists "Students can read own grades" on public.grades;

drop policy if exists "Admins can read grades" on public.grades;
drop policy if exists "Admins can insert grades" on public.grades;
drop policy if exists "Admins can update grades" on public.grades;
drop policy if exists "Admins can delete grades" on public.grades;
drop policy if exists "Approved students can read own grades" on public.grades;

create policy "Admins can read grades"
  on public.grades
  for select
  using (public.is_admin());

create policy "Admins can insert grades"
  on public.grades
  for insert
  with check (public.is_admin());

create policy "Admins can update grades"
  on public.grades
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete grades"
  on public.grades
  for delete
  using (public.is_admin());

create policy "Approved students can read own grades"
  on public.grades
  for select
  using (public.is_approved() and auth.uid() = user_id);

-- user_lab_progress

drop policy if exists "Users can read own lab progress" on public.user_lab_progress;
drop policy if exists "Users can insert own lab progress" on public.user_lab_progress;
drop policy if exists "Users can update own lab progress" on public.user_lab_progress;
drop policy if exists "Users can delete own lab progress" on public.user_lab_progress;

drop policy if exists "Admins can read lab progress" on public.user_lab_progress;
drop policy if exists "Admins can insert lab progress" on public.user_lab_progress;
drop policy if exists "Admins can update lab progress" on public.user_lab_progress;
drop policy if exists "Admins can delete lab progress" on public.user_lab_progress;
drop policy if exists "Approved users can read own lab progress" on public.user_lab_progress;
drop policy if exists "Approved users can insert own lab progress" on public.user_lab_progress;
drop policy if exists "Approved users can update own lab progress" on public.user_lab_progress;
drop policy if exists "Approved users can delete own lab progress" on public.user_lab_progress;

create policy "Admins can read lab progress"
  on public.user_lab_progress
  for select
  using (public.is_admin());

create policy "Admins can insert lab progress"
  on public.user_lab_progress
  for insert
  with check (public.is_admin());

create policy "Admins can update lab progress"
  on public.user_lab_progress
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete lab progress"
  on public.user_lab_progress
  for delete
  using (public.is_admin());

create policy "Approved users can read own lab progress"
  on public.user_lab_progress
  for select
  using (public.is_approved() and auth.uid() = user_id);

create policy "Approved users can insert own lab progress"
  on public.user_lab_progress
  for insert
  with check (public.is_approved() and auth.uid() = user_id);

create policy "Approved users can update own lab progress"
  on public.user_lab_progress
  for update
  using (public.is_approved() and auth.uid() = user_id)
  with check (public.is_approved() and auth.uid() = user_id);

create policy "Approved users can delete own lab progress"
  on public.user_lab_progress
  for delete
  using (public.is_approved() and auth.uid() = user_id);

notify pgrst, 'reload schema';
