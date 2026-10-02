create table public.products (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  creator_email text,
  name text not null,
  customer_price numeric not null check (customer_price >= 0),
  purchase_price_piece numeric not null check (purchase_price_piece >= 0),
  purchase_price_box numeric not null check (purchase_price_box >= 0)
);

alter table public.products enable row level security;

create policy "Authenticated users can read products"
  on public.products for select to authenticated using (true);
create policy "Authenticated users can insert products"
  on public.products for insert to authenticated with check (true);
create policy "Authenticated users can update products"
  on public.products for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete products"
  on public.products for delete to authenticated using (true);
