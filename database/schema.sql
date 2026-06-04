create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  role text not null check (role in ('customer', 'driver', 'admin', 'super_admin')),
  full_name text not null,
  phone text not null,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  user_id uuid primary key references users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  address text,
  telegram_chat_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists drivers (
  user_id uuid primary key references users(id) on delete cascade,
  driver_name text not null,
  phone text not null,
  vehicle_type text not null check (vehicle_type in ('4-seat vehicle', '7-seat vehicle')),
  plate_number text not null,
  seat_count integer not null check (seat_count in (4, 7)),
  available_seats integer not null default 0 check (available_seats >= 0 and available_seats <= seat_count),
  service_area text not null,
  telegram_chat_id text,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  rejected_reason text,
  archived_at timestamptz,
  vehicle_photo text,
  driver_photo text,
  description text,
  rating numeric(3, 2) default 5.0,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  plate_number text not null unique,
  vehicle_type text not null check (vehicle_type in ('4-seat vehicle', '7-seat vehicle')),
  capacity integer not null check (capacity in (4, 7)),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  route_type text not null check (route_type in ('dai_loc_to_da_nang', 'da_nang_to_dai_loc')),
  vehicle_id uuid references vehicles(id) on delete set null,
  driver_id uuid references drivers(user_id) on delete set null,
  passenger_count integer not null default 0,
  max_capacity integer not null check (max_capacity in (4, 7)),
  trip_status text not null default 'draft' check (trip_status in ('draft', 'scheduled', 'ready', 'boarding', 'in_progress', 'completed', 'cancelled')),
  estimated_departure timestamptz,
  actual_departure timestamptz,
  estimated_arrival timestamptz,
  completed_at timestamptz,
  total_revenue numeric(12, 0) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references users(id) on delete set null,
  driver_id uuid references users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  pickup_location text not null,
  dropoff_location text not null,
  booking_time timestamptz,
  travel_date text,
  travel_time text,
  pickup_lat numeric(10, 7),
  pickup_lng numeric(10, 7),
  dropoff_lat numeric(10, 7),
  dropoff_lng numeric(10, 7),
  passenger_count integer not null default 1,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'confirmed', 'matching', 'driver_assigned', 'on_the_way', 'completed', 'cancelled')),
  route_type text not null check (route_type in ('dai_loc_to_da_nang', 'da_nang_to_dai_loc')),
  estimated_distance_km numeric(10, 2),
  fare_base numeric(12, 0),
  fare_per_km numeric(12, 0),
  fare_multiplier numeric(6, 2),
  estimated_fare numeric(12, 0),
  customer_snapshot jsonb,
  driver_snapshot jsonb,
  vehicle_snapshot jsonb,
  status_history jsonb not null default '[]'::jsonb,
  trip_id uuid references trips(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trip_bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (trip_id, booking_id)
);

create table if not exists route_points (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  point_order integer not null,
  location_name text not null,
  lat numeric(10, 7),
  lng numeric(10, 7),
  point_type text not null default 'pickup',
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role text not null check (role in ('customer', 'driver', 'admin', 'super_admin')),
  title text not null,
  message text not null,
  type text not null,
  is_read boolean not null default false,
  related_booking_id uuid references bookings(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists driver_locations (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(user_id) on delete cascade,
  trip_id uuid references trips(id) on delete set null,
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  accuracy numeric(10, 2),
  speed numeric(10, 2),
  heading numeric(10, 2),
  recorded_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  trip_id uuid references trips(id) on delete set null,
  amount numeric(12, 0) not null,
  method text not null check (method in ('cash', 'bank_transfer', 'qr_code')),
  status text not null default 'unpaid' check (status in ('unpaid', 'pending', 'paid', 'refunded', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists driver_payouts (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(user_id) on delete cascade,
  trip_id uuid references trips(id) on delete set null,
  amount numeric(12, 0) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_role text not null check (actor_role in ('customer', 'driver', 'admin', 'super_admin')),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_username on users(username);
create index if not exists idx_customers_user_id on customers(user_id);
create index if not exists idx_drivers_user_id on drivers(user_id);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_bookings_route_type on bookings(route_type);
create index if not exists idx_bookings_customer_id on bookings(customer_id);
create index if not exists idx_bookings_driver_id on bookings(driver_id);
create index if not exists idx_trips_status on trips(trip_status);
create index if not exists idx_trip_bookings_trip_id on trip_bookings(trip_id);
create index if not exists idx_driver_locations_driver_id on driver_locations(driver_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_role on notifications(role);
create index if not exists idx_notifications_is_read on notifications(is_read);
