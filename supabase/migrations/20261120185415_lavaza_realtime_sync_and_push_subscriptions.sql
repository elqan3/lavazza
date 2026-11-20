create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.staff_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);
alter table public.staff_push_subscriptions enable row level security;
grant select, insert, delete on public.staff_push_subscriptions to authenticated;

create policy staff_read_own_push_subscriptions
on public.staff_push_subscriptions
for select to authenticated
using (
  user_id = (select auth.uid())
  and public.has_order_role(array['staff','manager','owner']::public.user_role[])
);

create policy staff_insert_own_push_subscriptions
on public.staff_push_subscriptions
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and public.has_order_role(array['staff','manager','owner']::public.user_role[])
);

create policy staff_delete_own_push_subscriptions
on public.staff_push_subscriptions
for delete to authenticated
using (
  user_id = (select auth.uid())
  and public.has_order_role(array['staff','manager','owner']::public.user_role[])
);

create table public.staff_push_deliveries (
  order_id uuid primary key references public.orders(id) on delete cascade,
  sent_at timestamptz not null default now()
);
alter table public.staff_push_deliveries enable row level security;
revoke all on public.staff_push_deliveries from public, anon, authenticated;
grant select, insert on public.staff_push_deliveries to service_role;

create policy lavaza_staff_read_orders_for_realtime
on public.orders
for select to authenticated
using (public.has_order_role(array['staff','manager','owner']::public.user_role[]));

create policy lavaza_staff_read_payments_for_realtime
on public.payments
for select to authenticated
using (public.has_order_role(array['staff','manager','owner']::public.user_role[]));

create policy lavaza_staff_read_products_for_realtime
on public.products
for select to authenticated
using (public.has_order_role(array['staff','manager','owner']::public.user_role[]));

create policy lavaza_staff_read_categories_for_realtime
on public.product_categories
for select to authenticated
using (public.has_order_role(array['staff','manager','owner']::public.user_role[]));

create policy lavaza_staff_read_branches_for_realtime
on public.branches
for select to authenticated
using (public.has_order_role(array['staff','manager','owner']::public.user_role[]));

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.payments;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.product_categories;
alter publication supabase_realtime add table public.branches;

create or replace function private.broadcast_lavaza_order_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_tracking_hash text;
  v_branch_id uuid;
  v_order_number bigint;
  v_event text;
begin
  if tg_table_name = 'orders' then
    v_order_id := new.id;
    v_tracking_hash := new.tracking_token_hash;
    v_branch_id := new.branch_id;
    v_order_number := new.order_number;
    v_event := 'orders_changed';
  else
    v_order_id := new.order_id;
    select o.tracking_token_hash, o.branch_id, o.order_number
      into v_tracking_hash, v_branch_id, v_order_number
    from public.orders o
    where o.id = v_order_id;
    v_event := 'payments_changed';
  end if;

  perform realtime.send(
    jsonb_build_object(
      'order_id', v_order_id,
      'order_number', v_order_number,
      'branch_id', v_branch_id,
      'table_name', tg_table_name,
      'operation', tg_op
    ),
    v_event,
    'lavaza:staff:orders',
    true
  );

  if v_tracking_hash is not null then
    perform realtime.send(
      jsonb_build_object('order_id', v_order_id),
      'order_changed',
      'lavaza:track:' || v_order_id::text || ':' || v_tracking_hash,
      false
    );
  end if;

  return null;
end;
$$;
revoke all on function private.broadcast_lavaza_order_event() from public, anon, authenticated;

create trigger lavaza_orders_realtime_broadcast
after insert or update of status on public.orders
for each row execute function private.broadcast_lavaza_order_event();

create trigger lavaza_payments_realtime_broadcast
after update of status on public.payments
for each row execute function private.broadcast_lavaza_order_event();

create or replace function private.broadcast_lavaza_catalog_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if tg_op = 'DELETE' then
    v_id := old.id;
  else
    v_id := new.id;
  end if;

  perform realtime.send(
    jsonb_build_object(
      'table_name', tg_table_name,
      'record_id', v_id,
      'operation', tg_op
    ),
    'catalog_changed',
    'lavaza:public:catalog',
    false
  );

  return null;
end;
$$;
revoke all on function private.broadcast_lavaza_catalog_event() from public, anon, authenticated;

create trigger lavaza_products_realtime_broadcast
after insert or update or delete on public.products
for each row execute function private.broadcast_lavaza_catalog_event();

create trigger lavaza_categories_realtime_broadcast
after insert or update or delete on public.product_categories
for each row execute function private.broadcast_lavaza_catalog_event();

create trigger lavaza_branches_realtime_broadcast
after insert or update or delete on public.branches
for each row execute function private.broadcast_lavaza_catalog_event();
