alter table public.orders drop constraint if exists orders_table_number_check;

create or replace function public.create_guest_order(
 p_customer_name text,p_customer_phone text,p_order_type public.order_type,p_payment_method public.payment_method,
 p_tracking_token_hash text,p_items jsonb,p_customer_notes text default null,p_table_number text default null,
 p_delivery_address text default null,p_delivery_location_note text default null,p_branch_id uuid default null)
returns table(order_id uuid,order_number bigint,subtotal numeric,total numeric,payment_deadline timestamptz)
language plpgsql security definer set search_path to 'public'
as $function$
declare
 v_order_id uuid; v_order_number bigint; v_subtotal numeric(10,2); v_payment_deadline timestamptz;
 v_item jsonb; v_product_id uuid; v_quantity integer; v_product_name text; v_unit_price numeric(10,2);
 v_phone text; v_initial_status public.order_status;
begin
 if p_branch_id is null or not exists(select 1 from public.branches b where b.id=p_branch_id and b.is_active=true) then raise exception 'Selected branch is unavailable'; end if;
 if p_customer_name is null or trim(p_customer_name)='' then raise exception 'Customer name is required'; end if;
 if char_length(trim(p_customer_name))>100 then raise exception 'Customer name is too long'; end if;
 if p_customer_phone is null or trim(p_customer_phone)='' then raise exception 'Customer phone is required'; end if;
 v_phone:=trim(p_customer_phone);
 if v_phone !~ '^[+]?[0-9][0-9 ()-]{5,19}$' then raise exception 'Invalid customer phone'; end if;
 if p_tracking_token_hash is null or char_length(trim(p_tracking_token_hash))<32 or char_length(trim(p_tracking_token_hash))>128 then raise exception 'Invalid tracking token hash'; end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'Order must contain at least one item'; end if;
 if jsonb_array_length(p_items)>50 then raise exception 'Too many items in one order'; end if;
 if char_length(coalesce(p_customer_notes,''))>500 or char_length(coalesce(p_table_number,''))>20 or char_length(coalesce(p_delivery_address,''))>300 or char_length(coalesce(p_delivery_location_note,''))>300 then raise exception 'One of the text fields is too long'; end if;
 if p_payment_method is null then raise exception 'Payment method is required'; end if;
 if p_order_type='delivery'::public.order_type and (p_delivery_address is null or trim(p_delivery_address)='') then raise exception 'Delivery address is required for delivery orders'; end if;
 if (select count(*) from public.orders o where o.customer_phone=v_phone and o.created_at>now()-interval '1 hour')>=10 then raise exception 'Too many orders, please try again later'; end if;
 if (select count(*) from public.orders o where o.customer_phone=v_phone and o.status in ('pending'::public.order_status,'awaiting_payment'::public.order_status))>=5 then raise exception 'Too many open orders for this phone number'; end if;
 if exists(select 1 from public.orders o where o.tracking_token_hash=p_tracking_token_hash) then raise exception 'Tracking token already exists'; end if;
 create temp table tmp_order_items(product_id uuid not null,product_name text not null,unit_price numeric(10,2) not null,quantity integer not null,subtotal numeric(10,2) not null) on commit drop;
 for v_item in select value from jsonb_array_elements(p_items) loop
   begin v_product_id:=(v_item->>'product_id')::uuid; exception when invalid_text_representation then raise exception 'Invalid product_id in order items'; end;
   if v_product_id is null then raise exception 'Each order item must contain a product_id'; end if;
   begin v_quantity:=(v_item->>'quantity')::integer; exception when invalid_text_representation then raise exception 'Invalid quantity in order items'; end;
   if v_quantity is null or v_quantity<=0 then raise exception 'Product quantity must be greater than zero'; end if;
   if v_quantity>100 then raise exception 'Maximum quantity per product is 100'; end if;
   select p.name,p.price into v_product_name,v_unit_price from public.products p where p.id=v_product_id and p.is_available=true;
   if not found then raise exception 'Product % is unavailable or does not exist',v_product_id; end if;
   insert into tmp_order_items values(v_product_id,v_product_name,v_unit_price,v_quantity,round(v_unit_price*v_quantity,2));
 end loop;
 select round(coalesce(sum(t.subtotal),0),2) into v_subtotal from tmp_order_items t;
 if v_subtotal<=0 then raise exception 'Order total must be greater than zero'; end if;
 if p_payment_method='bank_transfer'::public.payment_method then v_payment_deadline:=now()+interval '30 minutes';v_initial_status:='awaiting_payment'::public.order_status;
 else v_payment_deadline:=null;v_initial_status:='pending'::public.order_status; end if;
 insert into public.orders(tracking_token_hash,order_type,status,customer_name,customer_phone,customer_notes,table_number,delivery_address,delivery_location_note,subtotal,total,payment_deadline,expires_at,branch_id)
 values(p_tracking_token_hash,p_order_type,v_initial_status,trim(p_customer_name),v_phone,nullif(trim(p_customer_notes),''),null,nullif(trim(p_delivery_address),''),nullif(trim(p_delivery_location_note),''),v_subtotal,v_subtotal,v_payment_deadline,v_payment_deadline,p_branch_id)
 returning public.orders.id,public.orders.order_number into v_order_id,v_order_number;
 insert into public.order_items(order_id,product_id,product_name,unit_price,quantity,subtotal) select v_order_id,t.product_id,t.product_name,t.unit_price,t.quantity,t.subtotal from tmp_order_items t;
 insert into public.payments(order_id,method,status) values(v_order_id,p_payment_method,'pending'::public.payment_status);
 insert into public.order_status_history(order_id,old_status,new_status,changed_by,note) values(v_order_id,null,v_initial_status,null,case when p_payment_method='bank_transfer'::public.payment_method then 'Order created through guest checkout - awaiting bank transfer payment' else 'Order created through guest checkout' end);
 return query select v_order_id,v_order_number,v_subtotal,v_subtotal,v_payment_deadline;
end;
$function$;

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