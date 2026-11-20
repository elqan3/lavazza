grant select on public.orders, public.payments to authenticated;
revoke all on public.staff_push_subscriptions from public, anon;
grant select, insert, delete on public.staff_push_subscriptions to authenticated;
