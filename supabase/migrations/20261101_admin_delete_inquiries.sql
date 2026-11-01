-- Run this in Supabase SQL Editor to enable the portal's Delete inquiry action.
-- Existing inquiries are not changed by this migration.
begin;

grant delete on public.inquiries to authenticated;

drop policy if exists "Studio admins can delete inquiries" on public.inquiries;
create policy "Studio admins can delete inquiries" on public.inquiries
  for delete to authenticated using (
    exists (select 1 from public.admins where user_id = (select auth.uid()))
  );

commit;
