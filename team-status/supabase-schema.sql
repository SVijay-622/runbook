-- Run this SQL in your Supabase project:
-- Dashboard → SQL Editor → New Query → Paste & Run

create table if not exists public.team_status (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  status text not null default 'idle',
  task text default '',
  jira_ticket text default '',
  eta text default '',
  updated_at timestamptz default now()
);

-- Seed all 13 team members
insert into public.team_status (name) values
  ('Vijayandiran S'),
  ('Swathi'),
  ('Ummu Halima'),
  ('Fahad'),
  ('Faaiz'),
  ('Riaz'),
  ('Ismail'),
  ('Hashim'),
  ('Javith'),
  ('Ajay'),
  ('Sangeetha'),
  ('Raj'),
  ('Gokul')
on conflict (name) do nothing;

-- Enable Realtime so dashboard updates live without refresh
alter publication supabase_realtime add table public.team_status;

-- Allow public read/write (no auth needed for internal tool)
alter table public.team_status enable row level security;

create policy "Public read" on public.team_status for select using (true);
create policy "Public update" on public.team_status for update using (true);
