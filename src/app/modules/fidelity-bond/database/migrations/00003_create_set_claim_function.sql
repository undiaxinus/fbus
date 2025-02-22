-- Function to set custom claims in JWT
create or replace function public.set_claim(
  uid uuid,
  claim text,
  value text
)
returns void as $$
begin
  if not exists (
    select 1 from auth.users where id = uid
  ) then
    raise exception 'User not found';
  end if;

  -- Update the user's custom claims
  update auth.users
  set raw_app_meta_data = 
    coalesce(raw_app_meta_data, '{}'::jsonb) || 
    json_build_object(claim, value)::jsonb
  where id = uid;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function public.set_claim to authenticated;

-- Update the RLS policies to use app_metadata instead of user_metadata
drop policy if exists "Users can view all bonds" on public.fbus_fidelity_bonds;
drop policy if exists "Only admins can insert bonds" on public.fbus_fidelity_bonds;
drop policy if exists "Only admins can update bonds" on public.fbus_fidelity_bonds;
drop policy if exists "Only admins can delete bonds" on public.fbus_fidelity_bonds;

create policy "Users can view all bonds"
    on public.fbus_fidelity_bonds for select
    using (auth.jwt()->>'role' in ('fbus_admin', 'fbus_user') or
           coalesce((auth.jwt()->'app_metadata'->>'role')::text, '') in ('fbus_admin', 'fbus_user'));

create policy "Only admins can insert bonds"
    on public.fbus_fidelity_bonds for insert
    with check (auth.jwt()->>'role' = 'fbus_admin' or
                coalesce((auth.jwt()->'app_metadata'->>'role')::text, '') = 'fbus_admin');

create policy "Only admins can update bonds"
    on public.fbus_fidelity_bonds for update
    using (auth.jwt()->>'role' = 'fbus_admin' or
           coalesce((auth.jwt()->'app_metadata'->>'role')::text, '') = 'fbus_admin');

create policy "Only admins can delete bonds"
    on public.fbus_fidelity_bonds for delete
    using (auth.jwt()->>'role' = 'fbus_admin' or
           coalesce((auth.jwt()->'app_metadata'->>'role')::text, '') = 'fbus_admin'); 