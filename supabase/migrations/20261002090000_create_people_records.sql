create table public.people_records (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  creator_email text,
  name text not null,
  phone text,
  location text,
  status text not null default 'Pending' check (status in ('Pending', 'Cleared')),
  -- Sum of the person's items' prices.
  total_price numeric not null default 0,
  note text
);

alter table public.people_records enable row level security;

create policy "Authenticated users can read people records"
  on public.people_records for select to authenticated using (true);
create policy "Authenticated users can insert people records"
  on public.people_records for insert to authenticated with check (true);
create policy "Authenticated users can update people records"
  on public.people_records for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete people records"
  on public.people_records for delete to authenticated using (true);

-- Order's Items also holds a person's items: each item belongs to exactly one order or one person.
alter table public.order_items
  alter column order_id drop not null,
  add column person_id bigint references public.people_records (id) on delete cascade,
  add constraint order_items_one_owner check (num_nonnulls(order_id, person_id) = 1);

create index order_items_person_id_idx on public.order_items (person_id);
