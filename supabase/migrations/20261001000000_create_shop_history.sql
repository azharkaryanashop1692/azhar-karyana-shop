create table public.shop_history (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  cash_10_20 numeric not null default 0,
  cash_50_100 numeric not null default 0,
  cash_500_1000 numeric not null default 0,
  jazzcash numeric not null default 0,
  easypaisa numeric not null default 0,
  abbas numeric not null default 0,
  waqas numeric not null default 0,
  azhar numeric not null default 0,
  tassawar numeric not null default 0,
  pay_hafiz numeric not null default 0,
  pay_telenor numeric not null default 0,
  pay_jazz numeric not null default 0,
  pay_zong1 numeric not null default 0,
  pay_zong2 numeric not null default 0,
  pay_waqas numeric not null default 0,
  pay_abu numeric not null default 0,
  pay_others numeric not null default 0,
  hafiz_current numeric not null default 0,
  hafiz_purchased numeric not null default 0,
  hafiz_sold numeric not null default 0,
  telenor_current numeric not null default 0,
  telenor_purchased numeric not null default 0,
  telenor_sold numeric not null default 0,
  jazz_current numeric not null default 0,
  jazz_purchased numeric not null default 0,
  jazz_sold numeric not null default 0,
  ufone_current numeric not null default 0,
  ufone_purchased numeric not null default 0,
  ufone_sold numeric not null default 0,
  zong1_current numeric not null default 0,
  zong1_purchased numeric not null default 0,
  zong1_sold numeric not null default 0,
  zong2_current numeric not null default 0,
  zong2_purchased numeric not null default 0,
  zong2_sold numeric not null default 0,
  jazzcash_current numeric not null default 0,
  jazzcash_purchased numeric not null default 0,
  jazzcash_sold numeric not null default 0
);

alter table public.shop_history enable row level security;

create policy "Authenticated users can insert shop history"
  on public.shop_history for insert to authenticated with check (true);

create policy "Authenticated users can read shop history"
  on public.shop_history for select to authenticated using (true);
