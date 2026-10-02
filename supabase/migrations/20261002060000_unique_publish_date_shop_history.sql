-- Only one shop_history record per publish date.
alter table public.shop_history
  add constraint shop_history_publish_date_key unique (publish_date);
