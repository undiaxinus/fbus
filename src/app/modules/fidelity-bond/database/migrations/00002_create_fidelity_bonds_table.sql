-- Create fidelity bonds table
create table if not exists public.fbus_fidelity_bonds (
    id uuid default gen_random_uuid() primary key,
    unit_office varchar(50) not null,
    rank varchar(50) not null,
    name varchar(255) not null,
    designation varchar(255) not null,
    mca decimal(12,2) not null,
    amount_of_bond decimal(12,2) not null,
    bond_premium decimal(12,2) not null,
    risk_no varchar(50) not null,
    effectivity_date date not null,
    date_of_cancellation date not null,
    status varchar(50) not null,
    days_remaining integer,
    remark text,
    contact_no varchar(50),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.users(id),
    updated_by uuid references public.users(id),
    deleted_at timestamp with time zone default null
);

-- Create indexes for common queries
create index if not exists fbus_fidelity_bonds_unit_office_idx on public.fbus_fidelity_bonds(unit_office);
create index if not exists fbus_fidelity_bonds_name_idx on public.fbus_fidelity_bonds(name);
create index if not exists fbus_fidelity_bonds_status_idx on public.fbus_fidelity_bonds(status);
create index if not exists fbus_fidelity_bonds_effectivity_date_idx on public.fbus_fidelity_bonds(effectivity_date);
create index if not exists fbus_fidelity_bonds_date_of_cancellation_idx on public.fbus_fidelity_bonds(date_of_cancellation);

-- Enable Row Level Security
alter table public.fbus_fidelity_bonds enable row level security;

-- Create policies for access control
create policy "Users can view all bonds"
    on public.fbus_fidelity_bonds for select
    using (auth.jwt()->>'role' in ('fbus_admin', 'fbus_user'));

create policy "Only admins can insert bonds"
    on public.fbus_fidelity_bonds for insert
    with check (auth.jwt()->>'role' = 'fbus_admin');

create policy "Only admins can update bonds"
    on public.fbus_fidelity_bonds for update
    using (auth.jwt()->>'role' = 'fbus_admin');

create policy "Only admins can delete bonds"
    on public.fbus_fidelity_bonds for delete
    using (auth.jwt()->>'role' = 'fbus_admin');

-- Create function to automatically update days_remaining
create or replace function update_days_remaining()
returns trigger as $$
begin
    new.days_remaining = (new.date_of_cancellation - current_date)::integer;
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update days_remaining
create trigger update_fbus_fidelity_bonds_days_remaining
    before insert or update on public.fbus_fidelity_bonds
    for each row
    execute function update_days_remaining();

-- Create function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_fbus_fidelity_bonds_updated_at
    before update on public.fbus_fidelity_bonds
    for each row
    execute function update_updated_at_column(); 