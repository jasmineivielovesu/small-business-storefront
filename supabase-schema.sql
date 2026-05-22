-- ============================================================
-- Small Business Storefront — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────
create table if not exists profiles (
  id                  uuid references auth.users(id) on delete cascade primary key,
  full_name           text,
  phone               text,
  stripe_customer_id  text,
  created_at          timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── ADDRESSES ─────────────────────────────────────────────
create table if not exists addresses (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  full_name   text not null,
  line1       text not null,
  line2       text,
  city        text not null,
  state       text not null,
  zip         text not null,
  country     text not null default 'US',
  is_default  boolean default false,
  created_at  timestamptz default now()
);

-- ── ORDERS ────────────────────────────────────────────────
create table if not exists orders (
  id                        uuid default uuid_generate_v4() primary key,
  order_number              text unique not null,
  user_id                   uuid references auth.users(id) on delete set null,
  guest_email               text,
  guest_name                text,
  stripe_payment_intent_id  text unique,
  stripe_customer_id        text,
  subtotal_cents            integer not null,
  shipping_cents            integer not null default 699,
  total_cents               integer not null,
  status                    text not null default 'pending',
  shipping_name             text,
  shipping_line1            text,
  shipping_line2            text,
  shipping_city             text,
  shipping_state            text,
  shipping_zip              text,
  shipping_country          text default 'US',
  tracking_number           text,
  tracking_carrier          text,
  shipped_at                timestamptz,
  delivered_at              timestamptz,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

-- ── ORDER ITEMS ───────────────────────────────────────────
create table if not exists order_items (
  id                uuid default uuid_generate_v4() primary key,
  order_id          uuid references orders(id) on delete cascade,
  product_id        integer not null,
  product_name      text not null,
  scent             text,
  quantity          integer not null,
  unit_price_cents  integer not null,
  created_at        timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────
alter table profiles    enable row level security;
alter table addresses   enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

create policy "Users can view own profile"    on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"  on profiles for update using (auth.uid() = id);
create policy "Users can manage own addresses" on addresses for all using (auth.uid() = user_id);
create policy "Users can view own orders"     on orders for select using (auth.uid() = user_id);
create policy "Users can view own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- ── AUTO UPDATE updated_at ────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute procedure update_updated_at();
