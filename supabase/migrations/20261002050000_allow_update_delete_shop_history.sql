create policy "Authenticated users can update shop history"
  on public.shop_history for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete shop history"
  on public.shop_history for delete to authenticated using (true);

-- Updating a record replaces its expenses.
create policy "Authenticated users can delete expenses"
  on public.expenses for delete to authenticated using (true);
