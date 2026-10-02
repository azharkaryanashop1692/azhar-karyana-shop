create table public.orders (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  creator_email text,
  name text not null,
  -- Sum of the order's items' prices.
  price numeric not null default 0
);

-- Order's Items: each item belongs to one order.
create table public.order_items (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  order_id bigint not null references public.orders (id) on delete cascade,
  name text not null,
  price numeric not null check (price >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Authenticated users can read orders"
  on public.orders for select to authenticated using (true);
create policy "Authenticated users can insert orders"
  on public.orders for insert to authenticated with check (true);
create policy "Authenticated users can update orders"
  on public.orders for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete orders"
  on public.orders for delete to authenticated using (true);

create policy "Authenticated users can read order items"
  on public.order_items for select to authenticated using (true);
create policy "Authenticated users can insert order items"
  on public.order_items for insert to authenticated with check (true);
create policy "Authenticated users can delete order items"
  on public.order_items for delete to authenticated using (true);
