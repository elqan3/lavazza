-- Order branches and customer branch selection.
-- Applied to production as migration 20261004123033.

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branches_name_not_empty check (char_length(trim(name)) > 0)
);

alter table public.branches enable row level security;

insert into public.branches (name, is_active, sort_order)
values
  ('فرع شارع السلام', true, 1),
  ('فرع الشرشاره', true, 2),
  ('فرع المول', true, 3);

alter table public.orders add column branch_id uuid;

update public.orders o
set branch_id = b.id
from (
  select id, row_number() over (order by sort_order, id) as rn
  from public.branches
) b
where b.rn = ((abs(hashtext(o.id::text)) % 3) + 1);

alter table public.orders alter column branch_id set not null;

alter table public.orders
  add constraint orders_branch_id_fkey
  foreign key (branch_id) references public.branches(id)
  on update cascade on delete restrict;

create index orders_branch_id_created_at_idx
  on public.orders(branch_id, created_at desc);

create index branches_active_sort_idx
  on public.branches(is_active, sort_order);

create or replace function public.branches_set_updated_at()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create trigger branches_set_updated_at
before update on public.branches
for each row execute function public.branches_set_updated_at();

create policy "Public can view active branches"
on public.branches
for select
to anon, authenticated
using (is_active = true);

revoke insert, update, delete on public.branches from anon, authenticated;

create or replace function public.get_active_order_branches()
returns table(id uuid, name text, sort_order integer)
language sql
stable
security invoker
set search_path to ''
as $function$
select b.id, b.name, b.sort_order
from public.branches b
where b.is_active = true
order by b.sort_order asc, b.name asc;
$function$;

revoke execute on function public.get_active_order_branches() from public;
grant execute on function public.get_active_order_branches() to anon, authenticated;

create or replace function public.get_order_management_branches()
returns table(id uuid, name text, is_active boolean, sort_order integer)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_order_role(array['staff','manager','owner']::public.user_role[]) then
    raise exception 'You are not authorized to manage branches';
  end if;

  return query
  select b.id, b.name, b.is_active, b.sort_order
  from public.branches b
  order by b.sort_order asc, b.name asc;
end;
$function$;

revoke execute on function public.get_order_management_branches() from public;
grant execute on function public.get_order_management_branches() to authenticated;

create or replace function public.set_order_branch_active(p_branch_id uuid, p_is_active boolean)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_order_role(array['manager','owner']::public.user_role[]) then
    raise exception 'You are not authorized to manage branches';
  end if;

  if p_branch_id is null then
    raise exception 'Branch is required';
  end if;

  update public.branches
  set is_active = p_is_active
  where id = p_branch_id;

  if not found then
    raise exception 'Branch not found';
  end if;

  return true;
end;
$function$;

revoke execute on function public.set_order_branch_active(uuid, boolean) from public;
grant execute on function public.set_order_branch_active(uuid, boolean) to authenticated;

-- The existing order RPCs are recreated by this migration with branch validation
-- and branch information in their result sets.


-- Recreate order RPCs with branch support.
drop function if exists public.get_order_management_orders(public.order_status,text,integer,integer);
drop function if exists public.get_guest_order(uuid,text);
drop function if exists public.create_guest_order(text,text,public.order_type,public.payment_method,text,jsonb,text,text,text,text);

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
 if p_branch_id is null or not exists(select 1 from public.branches b where b.id=p_branch_id and b.is_active=true)
 then raise exception 'Selected branch is unavailable'; end if;
 if p_customer_name is null or trim(p_customer_name)='' then raise exception 'Customer name is required'; end if;
 if char_length(trim(p_customer_name))>100 then raise exception 'Customer name is too long'; end if;
 if p_customer_phone is null or trim(p_customer_phone)='' then raise exception 'Customer phone is required'; end if;
 v_phone:=trim(p_customer_phone);
 if v_phone !~ '^[+]?[0-9][0-9 ()-]{5,19}$' then raise exception 'Invalid customer phone'; end if;
 if p_tracking_token_hash is null or char_length(trim(p_tracking_token_hash))<32 or char_length(trim(p_tracking_token_hash))>128
 then raise exception 'Invalid tracking token hash'; end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'Order must contain at least one item'; end if;
 if jsonb_array_length(p_items)>50 then raise exception 'Too many items in one order'; end if;
 if char_length(coalesce(p_customer_notes,''))>500 or char_length(coalesce(p_table_number,''))>20 or char_length(coalesce(p_delivery_address,''))>300 or char_length(coalesce(p_delivery_location_note,''))>300
 then raise exception 'One of the text fields is too long'; end if;
 if p_payment_method is null then raise exception 'Payment method is required'; end if;
 if p_order_type='delivery'::public.order_type and (p_delivery_address is null or trim(p_delivery_address)='') then raise exception 'Delivery address is required for delivery orders'; end if;
 if p_order_type='dine_in'::public.order_type and (p_table_number is null or trim(p_table_number)='') then raise exception 'Table number is required for dine-in orders'; end if;
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
 values(p_tracking_token_hash,p_order_type,v_initial_status,trim(p_customer_name),v_phone,nullif(trim(p_customer_notes),''),nullif(trim(p_table_number),''),nullif(trim(p_delivery_address),''),nullif(trim(p_delivery_location_note),''),v_subtotal,v_subtotal,v_payment_deadline,v_payment_deadline,p_branch_id)
 returning id,order_number into v_order_id,v_order_number;
 insert into public.order_items(order_id,product_id,product_name,unit_price,quantity,subtotal) select v_order_id,t.product_id,t.product_name,t.unit_price,t.quantity,t.subtotal from tmp_order_items t;
 insert into public.payments(order_id,method,status) values(v_order_id,p_payment_method,'pending'::public.payment_status);
 insert into public.order_status_history(order_id,old_status,new_status,changed_by,note) values(v_order_id,null,v_initial_status,null,case when p_payment_method='bank_transfer'::public.payment_method then 'Order created through guest checkout - awaiting bank transfer payment' else 'Order created through guest checkout' end);
 return query select v_order_id,v_order_number,v_subtotal,v_subtotal,v_payment_deadline;
end;
$function$;
revoke execute on function public.create_guest_order(text,text,public.order_type,public.payment_method,text,jsonb,text,text,text,text,uuid) from public;
grant execute on function public.create_guest_order(text,text,public.order_type,public.payment_method,text,jsonb,text,text,text,text,uuid) to anon,authenticated;

create or replace function public.get_order_management_orders(p_status public.order_status default null,p_search text default null,p_limit integer default 50,p_offset integer default 0)
returns table(order_id uuid,order_number bigint,order_type public.order_type,order_status public.order_status,customer_name text,customer_phone text,total numeric,payment_method public.payment_method,payment_status public.payment_status,payment_deadline timestamptz,proof_count bigint,latest_proof_at timestamptz,created_at timestamptz,updated_at timestamptz,branch_id uuid,branch_name text)
language plpgsql security definer set search_path to ''
as $function$
begin
 if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
 if not public.has_order_role(array['staff','manager','owner']::public.user_role[]) then raise exception 'You are not authorized to view orders'; end if;
 if p_limit is null or p_limit<1 or p_limit>100 then raise exception 'Invalid limit'; end if;
 if p_offset is null or p_offset<0 then raise exception 'Invalid offset'; end if;
 return query
 select o.id,o.order_number,o.order_type,o.status,o.customer_name,o.customer_phone,o.total,p.method,p.status,o.payment_deadline,count(pp.id),max(pp.uploaded_at),o.created_at,o.updated_at,b.id,b.name
 from public.orders o join public.payments p on p.order_id=o.id join public.branches b on b.id=o.branch_id left join public.payment_proofs pp on pp.payment_id=p.id
 where (p_status is null or o.status=p_status) and (p_search is null or length(trim(p_search))=0 or o.customer_name ilike '%'||trim(p_search)||'%' or o.customer_phone ilike '%'||trim(p_search)||'%' or o.order_number::text=trim(p_search))
 group by o.id,o.order_number,o.order_type,o.status,o.customer_name,o.customer_phone,o.total,p.method,p.status,o.payment_deadline,o.created_at,o.updated_at,b.id,b.name
 order by o.created_at desc limit p_limit offset p_offset;
end;
$function$;
revoke execute on function public.get_order_management_orders(public.order_status,text,integer,integer) from public;
grant execute on function public.get_order_management_orders(public.order_status,text,integer,integer) to authenticated;

create or replace function public.get_guest_order(p_order_id uuid,p_tracking_token_hash text)
returns table(order_id uuid,order_number bigint,order_type public.order_type,order_status public.order_status,customer_name text,customer_phone text,customer_notes text,table_number text,delivery_address text,delivery_location_note text,subtotal numeric,total numeric,created_at timestamptz,updated_at timestamptz,payment_deadline timestamptz,payment_method public.payment_method,payment_status public.payment_status,payment_rejection_reason text,items jsonb,status_history jsonb,branch_id uuid,branch_name text)
language plpgsql security definer set search_path to ''
as $function$
declare v_order_id uuid;
begin
 if p_order_id is null or p_tracking_token_hash is null or length(trim(p_tracking_token_hash))=0 then raise exception 'بيانات تتبع الطلب غير صالحة.'; end if;
 select o.id into v_order_id from public.orders o where o.id=p_order_id and o.tracking_token_hash=p_tracking_token_hash;
 if v_order_id is null then raise exception 'الطلب غير موجود أو رمز التتبع غير صحيح.'; end if;
 return query
 select o.id,o.order_number,o.order_type,o.status,o.customer_name,o.customer_phone,o.customer_notes,o.table_number,o.delivery_address,o.delivery_location_note,o.subtotal,o.total,o.created_at,o.updated_at,o.payment_deadline,p.method,p.status,p.rejection_reason,
 coalesce((select jsonb_agg(jsonb_build_object('id',oi.id,'productId',oi.product_id,'productName',oi.product_name,'unitPrice',oi.unit_price,'quantity',oi.quantity,'subtotal',oi.subtotal) order by oi.created_at asc) from public.order_items oi where oi.order_id=o.id),'[]'::jsonb),
 coalesce((select jsonb_agg(jsonb_build_object('status',osh.new_status,'note',osh.note,'createdAt',osh.created_at) order by osh.created_at asc) from public.order_status_history osh where osh.order_id=o.id),'[]'::jsonb),
 b.id,b.name
 from public.orders o join public.payments p on p.order_id=o.id join public.branches b on b.id=o.branch_id where o.id=v_order_id;
end;
$function$;
revoke execute on function public.get_guest_order(uuid,text) from public;
grant execute on function public.get_guest_order(uuid,text) to anon,authenticated;

create or replace function public.get_order_management_order(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path to ''
as $function$
declare v_result jsonb;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
 if not public.has_order_role(array['staff','manager','owner']::public.user_role[]) then raise exception 'You are not authorized to view orders'; end if;
 select jsonb_build_object(
  'order',jsonb_build_object('id',o.id,'orderNumber',o.order_number,'orderType',o.order_type,'status',o.status,'customerName',o.customer_name,'customerPhone',o.customer_phone,'customerNotes',o.customer_notes,'tableNumber',o.table_number,'deliveryAddress',o.delivery_address,'deliveryLocationNote',o.delivery_location_note,'subtotal',o.subtotal,'total',o.total,'expiresAt',o.expires_at,'paymentDeadline',o.payment_deadline,'createdAt',o.created_at,'updatedAt',o.updated_at,'branchId',b.id,'branchName',b.name),
  'payment',jsonb_build_object('id',p.id,'method',p.method,'status',p.status,'verifiedBy',p.verified_by,'verifiedAt',p.verified_at,'rejectionReason',p.rejection_reason,'createdAt',p.created_at,'updatedAt',p.updated_at),
  'items',coalesce((select jsonb_agg(jsonb_build_object('id',oi.id,'productId',oi.product_id,'productName',oi.product_name,'unitPrice',oi.unit_price,'quantity',oi.quantity,'subtotal',oi.subtotal) order by oi.created_at asc) from public.order_items oi where oi.order_id=o.id),'[]'::jsonb),
  'proofs',coalesce((select jsonb_agg(jsonb_build_object('id',pp.id,'storagePath',pp.storage_path,'uploadedAt',pp.uploaded_at,'createdAt',pp.created_at) order by pp.uploaded_at asc) from public.payment_proofs pp where pp.payment_id=p.id),'[]'::jsonb),
  'statusHistory',coalesce((select jsonb_agg(jsonb_build_object('id',osh.id,'oldStatus',osh.old_status,'newStatus',osh.new_status,'changedBy',osh.changed_by,'note',osh.note,'createdAt',osh.created_at) order by osh.created_at asc) from public.order_status_history osh where osh.order_id=o.id),'[]'::jsonb),
  'paymentStatusHistory',coalesce((select jsonb_agg(jsonb_build_object('id',psh.id,'oldStatus',psh.old_status,'newStatus',psh.new_status,'changedBy',psh.changed_by,'note',psh.note,'createdAt',psh.created_at) order by psh.created_at asc) from public.payment_status_history psh where psh.payment_id=p.id),'[]'::jsonb)
 )
 into v_result
 from public.orders o join public.payments p on p.order_id=o.id join public.branches b on b.id=o.branch_id
 where o.id=p_order_id;
 if v_result is null then raise exception 'Order not found'; end if;
 return v_result;
end;
$function$;
