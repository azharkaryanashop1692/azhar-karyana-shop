alter table public.shop_history
  add column publish_date date not null default current_date;
