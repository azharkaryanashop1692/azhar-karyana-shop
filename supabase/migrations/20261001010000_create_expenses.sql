create table public.expenses (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  shop_history_id bigint not null references public.shop_history (id) on delete cascade,
  name text not null,
  price numeric not null check (price > 0),
  status text not null check (status in ('Load', 'Other'))
);

create index expenses_shop_history_id_idx on public.expenses (shop_history_id);

alter table public.expenses enable row level security;

create policy "Authenticated users can insert expenses"
  on public.expenses for insert to authenticated with check (true);

create policy "Authenticated users can read expenses"
  on public.expenses for select to authenticated using (true);
