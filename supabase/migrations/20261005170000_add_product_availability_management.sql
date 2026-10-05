-- Product availability management for staff
create or replace function public.get_order_management_products()
returns table(
  id uuid,
  category_id uuid,
  category_name text,
  name text,
  description text,
  price numeric,
  image_url text,
  is_available boolean,
  sort_order integer
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_order_role(
    array['staff','manager','owner']::public.user_role[]
  ) then
    raise exception 'You are not authorized to manage products';
  end if;

  return query
  select
    p.id,
    p.category_id,
    pc.name,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.is_available,
    p.sort_order
  from public.products p
  left join public.product_categories pc
    on pc.id = p.category_id
  order by
    coalesce(pc.sort_order, 2147483647),
    p.sort_order,
    p.name;
end;
$function$;

revoke execute on function public.get_order_management_products() from public, anon, authenticated;
grant execute on function public.get_order_management_products() to authenticated;

create or replace function public.set_product_availability(
  p_product_id uuid,
  p_is_available boolean
)
returns public.products
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_product public.products;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_order_role(
    array['staff','manager','owner']::public.user_role[]
  ) then
    raise exception 'You are not authorized to manage product availability';
  end if;

  update public.products
  set
    is_available = p_is_available,
    updated_at = now()
  where id = p_product_id
  returning * into v_product;

  if not found then
    raise exception 'Product not found';
  end if;

  return v_product;
end;
$function$;

revoke execute on function public.set_product_availability(uuid, boolean) from public, anon, authenticated;
grant execute on function public.set_product_availability(uuid, boolean) to authenticated;
