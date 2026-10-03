-- The typed Remain value is now stored in *_remaining (previously *_sold);
-- the old calculated *_remaining columns are dropped.
alter table public.shop_history drop column hafiz_remaining;
alter table public.shop_history drop column telenor_remaining;
alter table public.shop_history drop column jazz_remaining;
alter table public.shop_history drop column ufone_remaining;
alter table public.shop_history drop column zong1_remaining;
alter table public.shop_history drop column zong2_remaining;
alter table public.shop_history drop column jazzcash_remaining;
alter table public.shop_history rename column hafiz_sold to hafiz_remaining;
alter table public.shop_history rename column telenor_sold to telenor_remaining;
alter table public.shop_history rename column jazz_sold to jazz_remaining;
alter table public.shop_history rename column ufone_sold to ufone_remaining;
alter table public.shop_history rename column zong1_sold to zong1_remaining;
alter table public.shop_history rename column zong2_sold to zong2_remaining;
alter table public.shop_history rename column jazzcash_sold to jazzcash_remaining;
