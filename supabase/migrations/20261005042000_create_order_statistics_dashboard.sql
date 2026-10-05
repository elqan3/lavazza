create or replace function public.get_order_dashboard_stats(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 365));
  v_start timestamptz := date_trunc('day', now()) - ((v_days - 1) * interval '1 day');
  v_today_start timestamptz := date_trunc('day', now());
  v_result jsonb;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not public.has_order_role(array['staff','manager','owner']::public.user_role[]) then raise exception 'You are not authorized to view order statistics'; end if;
  with base as (
    select o.id,o.order_number,o.status,o.order_type,o.total,o.branch_id,b.name as branch_name,
      p.method as payment_method,p.status as payment_status,o.created_at
    from public.orders o join public.payments p on p.order_id=o.id join public.branches b on b.id=o.branch_id
    where o.created_at >= v_start
  ), kpis as (
    select count(*)::integer as orders_count,
      count(*) filter (where status='completed')::integer as completed_count,
      count(*) filter (where status in ('pending','awaiting_payment','confirmed','preparing','ready'))::integer as active_count,
      count(*) filter (where status in ('cancelled','rejected'))::integer as cancelled_count,
      coalesce(sum(total) filter (where status='completed'),0)::numeric as revenue,
      coalesce(avg(total) filter (where status='completed'),0)::numeric as average_order_value,
      count(*) filter (where created_at>=v_today_start)::integer as today_orders,
      coalesce(sum(total) filter (where status='completed' and created_at>=v_today_start),0)::numeric as today_revenue
    from base
  ), daily as (
    select to_char(d.day,'DD Mon') as day,d.day::date as date,count(b.id)::integer as orders,
      coalesce(sum(b.total) filter (where b.status='completed'),0)::numeric as revenue
    from generate_series(v_start::date,current_date,interval '1 day') d(day)
    left join base b on b.created_at>=d.day and b.created_at<d.day+interval '1 day'
    group by d.day order by d.day
  ), branches as (
    select branch_id as id,branch_name as name,count(*)::integer as orders,
      count(*) filter (where status='completed')::integer as completed_orders,
      coalesce(sum(total) filter (where status='completed'),0)::numeric as revenue
    from base group by branch_id,branch_name order by revenue desc,orders desc
  ), order_types as (
    select order_type as type,count(*)::integer as orders,
      coalesce(sum(total) filter (where status='completed'),0)::numeric as revenue
    from base group by order_type order by orders desc
  ), payments as (
    select payment_method as method,count(*)::integer as orders,
      coalesce(sum(total) filter (where status='completed'),0)::numeric as revenue
    from base group by payment_method order by orders desc
  ), products as (
    select oi.product_id as id,oi.product_name as name,
      coalesce(sum(oi.quantity) filter (where o.status='completed'),0)::integer as quantity,
      coalesce(sum(oi.subtotal) filter (where o.status='completed'),0)::numeric as revenue
    from public.order_items oi join public.orders o on o.id=oi.order_id
    where o.created_at>=v_start
    group by oi.product_id,oi.product_name
    having coalesce(sum(oi.quantity) filter (where o.status='completed'),0)>0
    order by quantity desc,revenue desc limit 10
  )
  select jsonb_build_object(
    'periodDays',v_days,'startDate',v_start,'kpis',(select to_jsonb(kpis) from kpis),
    'daily',coalesce((select jsonb_agg(to_jsonb(daily) order by date) from daily),'[]'::jsonb),
    'branches',coalesce((select jsonb_agg(to_jsonb(branches)) from branches),'[]'::jsonb),
    'orderTypes',coalesce((select jsonb_agg(to_jsonb(order_types)) from order_types),'[]'::jsonb),
    'payments',coalesce((select jsonb_agg(to_jsonb(payments)) from payments),'[]'::jsonb),
    'products',coalesce((select jsonb_agg(to_jsonb(products)) from products),'[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$function$;

revoke all on function public.get_order_dashboard_stats(integer) from public;
grant execute on function public.get_order_dashboard_stats(integer) to authenticated;