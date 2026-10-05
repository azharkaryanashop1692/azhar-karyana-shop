-- Today Cash: Mazhar, Others. Payable Amount: Azhar, Tassawar, Mazhar.
alter table public.shop_history add column mazhar numeric not null default 0;
alter table public.shop_history add column others numeric not null default 0;
alter table public.shop_history add column pay_azhar numeric not null default 0;
alter table public.shop_history add column pay_tassawar numeric not null default 0;
alter table public.shop_history add column pay_mazhar numeric not null default 0;
