alter table if exists public.user_lab_progress
    add column if not exists status text not null default 'started';

alter table if exists public.user_lab_progress
    add column if not exists score numeric;

alter table if exists public.user_lab_progress
    add column if not exists updated_at timestamptz not null default now();

-- (optional but recommended) keep updated_at fresh on updates
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_lab_progress_updated_at on public.user_lab_progress;

create trigger trg_user_lab_progress_updated_at
    before update on public.user_lab_progress
    for each row execute function public.set_updated_at();