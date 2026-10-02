alter table public.shop_history
  add column total_sale numeric not null default 0,
  add column creator_email text;

-- Backfill the creator for records saved before this column existed.
update public.shop_history h
  set creator_email = u.email
  from auth.users u
  where h.created_by = u.id and h.creator_email is null;
