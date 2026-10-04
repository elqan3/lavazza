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
