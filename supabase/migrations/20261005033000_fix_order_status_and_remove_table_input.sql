create or replace function public.update_order_status(p_order_id uuid, p_new_status public.order_status, p_note text default null)
returns table(order_id uuid, order_number bigint, old_status public.order_status, new_status public.order_status)
language plpgsql security definer set search_path to 'public'
as $function$
declare v_old_status public.order_status;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
 if not public.has_order_role(array['staff','manager','owner']::public.user_role[]) then raise exception 'You are not authorized to update orders'; end if;
 if p_new_status is null then raise exception 'New status is required'; end if;
 select o.status into v_old_status from public.orders o where o.id=p_order_id for update;
 if not found then raise exception 'Order not found'; end if;
 if v_old_status=p_new_status then raise exception 'Order already has this status'; end if;
 if v_old_status='pending' and p_new_status not in ('confirmed','cancelled','rejected') then raise exception 'Invalid order status transition';
 elsif v_old_status='confirmed' and p_new_status not in ('preparing','cancelled') then raise exception 'Invalid order status transition';
 elsif v_old_status='preparing' and p_new_status not in ('ready','cancelled') then raise exception 'Invalid order status transition';
 elsif v_old_status='ready' and p_new_status not in ('completed','cancelled') then raise exception 'Invalid order status transition';
 elsif v_old_status in ('awaiting_payment','completed','cancelled','rejected') then raise exception 'Order cannot transition from status % using this action',v_old_status;
 end if;
 update public.orders set status=p_new_status where id=p_order_id;
 insert into public.order_status_history(order_id,old_status,new_status,changed_by,note)
 values(p_order_id,v_old_status,p_new_status,(select auth.uid()),nullif(trim(p_note),''));
 return query select o.id,o.order_number,v_old_status,o.status from public.orders o where o.id=p_order_id;
end;
$function$;