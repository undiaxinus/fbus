-- Create users table for authentication
create table if not exists public.users (
    id uuid default gen_random_uuid() primary key,
    email varchar(255) not null unique,
    encrypted_password varchar(255) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on email for faster lookups
create index if not exists users_email_idx on public.users(email);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Create policy to allow users to only see and update their own data
create policy "Users can view own profile"
    on public.users for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.users for update
    using (auth.uid() = id);