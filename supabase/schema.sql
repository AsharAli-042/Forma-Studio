-- Run this once in your Supabase project's SQL Editor.
-- No service-role key is needed by the application.
begin;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;
drop policy if exists "Admins can read their own membership" on public.admins;
create policy "Admins can read their own membership" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  email text not null check (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  service text not null check (service in ('Full-service interiors', 'Room refresh', 'Design consultation')),
  budget text not null check (budget in ('Under $5,000', '$5,000–$15,000', '$15,000–$50,000', '$50,000+', 'Let’s discuss')),
  message text not null check (char_length(btrim(message)) between 10 and 3000),
  status text not null default 'new' check (status in ('new', 'contacted', 'completed'))
);
create index if not exists inquiries_created_at_idx on public.inquiries(created_at desc);
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant insert (name, email, service, budget, message) on public.inquiries to anon;
grant select on public.inquiries to authenticated;
grant update (status) on public.inquiries to authenticated;

drop policy if exists "Visitors can submit new inquiries" on public.inquiries;
create policy "Visitors can submit new inquiries" on public.inquiries
  for insert to anon with check (status = 'new');
drop policy if exists "Studio admins can read inquiries" on public.inquiries;
create policy "Studio admins can read inquiries" on public.inquiries
  for select to authenticated using (
    exists (select 1 from public.admins where user_id = (select auth.uid()))
  );
drop policy if exists "Studio admins can update statuses" on public.inquiries;
create policy "Studio admins can update statuses" on public.inquiries
  for update to authenticated using (
    exists (select 1 from public.admins where user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.admins where user_id = (select auth.uid()))
  );

commit;

-- NEXT: Create an email/password user under Authentication > Users > Add user.
-- Enable Auto Confirm User when creating the admin manually.
-- Then replace the email below and run this statement separately:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL'
-- on conflict (user_id) do nothing;
