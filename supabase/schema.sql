create extension if not exists "pgcrypto";

create table if not exists public.support_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  provider text not null,
  company_name text not null,
  page_url text not null,
  page_title text,
  domain text not null,
  case_id text,
  order_id text,
  promised_outcome text not null,
  promise_summary text,
  amount_cents integer,
  currency text default 'USD',
  status text not null default 'promised',
  follow_up_at timestamptz,
  promised_for_at timestamptz,
  captured_at timestamptz not null default now(),
  screenshot_data_url text,
  transcript_preview text
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  support_case_id uuid not null references public.support_cases(id) on delete cascade,
  speaker text not null default 'unknown',
  message_text text not null,
  captured_at timestamptz not null default now()
);

create index if not exists support_cases_status_idx on public.support_cases(status);
create index if not exists support_cases_follow_up_idx on public.support_cases(follow_up_at);
create index if not exists support_messages_case_idx on public.support_messages(support_case_id);
