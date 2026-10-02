-- App-level user table linked to Supabase auth users.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  shop_needs text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read their own row"
  on public.users for select to authenticated using (id = auth.uid());

create policy "Users can insert their own row"
  on public.users for insert to authenticated with check (id = auth.uid());

create policy "Users can update their own row"
  on public.users for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Rows for users that already exist.
insert into public.users (id, email)
  select id, email from auth.users
  on conflict (id) do nothing;
