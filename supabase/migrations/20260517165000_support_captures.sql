create table if not exists public.support_captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  extension_capture_id text not null,
  company text,
  issue_title text,
  promised_outcome text,
  provider_name text,
  source_url text,
  follow_up_at date,
  amount_label text,
  capture jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, extension_capture_id)
);

alter table public.support_captures enable row level security;

create policy "support_captures_select_own"
  on public.support_captures
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "support_captures_insert_own"
  on public.support_captures
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "support_captures_update_own"
  on public.support_captures
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists support_captures_user_created_idx
  on public.support_captures (user_id, created_at desc);

create index if not exists support_captures_capture_gin_idx
  on public.support_captures using gin (capture);
