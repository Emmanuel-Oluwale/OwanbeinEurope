create extension if not exists pgcrypto;

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  description text,
  venue_name text,
  venue_address text,
  city text,
  country text,
  event_date timestamptz,
  hero_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'completed'))
);

create table if not exists ticket_types (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  description text,
  price_czk bigint not null,
  quantity_available bigint not null default 0,
  quantity_sold bigint not null default 0,
  sale_start timestamptz,
  sale_end timestamptz,
  active boolean not null default true,
  unique (event_id, name)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_number text not null unique,
  email text not null,
  full_name text not null,
  phone text,
  total_amount bigint not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'cancelled', 'refunded')),
  event_id uuid not null references events(id),
  user_id uuid,
  variable_symbol text,
  payment_account_label text,
  approved_by text,
  approved_at timestamptz
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid not null references orders(id) on delete cascade,
  ticket_type_id uuid not null references ticket_types(id),
  attendee_name text not null,
  attendee_email text not null,
  qr_code text,
  ticket_code text not null unique,
  status text not null default 'valid' check (status in ('valid', 'used', 'cancelled', 'refunded'))
);

create table if not exists order_attendees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid not null references orders(id) on delete cascade,
  ticket_type_id uuid not null references ticket_types(id),
  attendee_name text not null,
  attendee_email text not null,
  attendee_phone text,
  ticket_id uuid references tickets(id)
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ticket_id uuid not null references tickets(id),
  checked_in_by text,
  checked_in_at timestamptz not null default now()
);

create table if not exists event_media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_id uuid not null references events(id) on delete cascade,
  media_type text not null,
  url text not null,
  caption text,
  sort_order bigint not null default 0,
  active boolean not null default true
);

create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  role text not null check (role in ('admin', 'finance', 'checkin', 'marketing')),
  unique (email, role)
);

create index if not exists ticket_types_event_id_idx on ticket_types(event_id);
create index if not exists orders_event_id_idx on orders(event_id);
create index if not exists orders_order_number_email_idx on orders(order_number, email);
create index if not exists order_attendees_order_id_idx on order_attendees(order_id);
create index if not exists tickets_order_id_idx on tickets(order_id);
create index if not exists tickets_ticket_code_idx on tickets(ticket_code);
create index if not exists checkins_ticket_id_idx on checkins(ticket_id);
create index if not exists event_media_event_id_idx on event_media(event_id);

insert into events (
  title,
  slug,
  description,
  venue_name,
  venue_address,
  city,
  country,
  event_date,
  status
) values (
  'Owanbe in Europe: Naija to Prague',
  'naija-to-prague-2026',
  'Premium Nigerian Owanbe community celebration in Prague with music, food, fashion, culture, and dancing.',
  'Highlight Event Centre Hlubocepy',
  'Hlubocepska 1287/2a, Prague',
  'Prague',
  'Czech Republic',
  '2026-08-15T13:00:00.000Z',
  'published'
) on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  venue_name = excluded.venue_name,
  venue_address = excluded.venue_address,
  city = excluded.city,
  country = excluded.country,
  event_date = excluded.event_date,
  status = excluded.status;

insert into ticket_types (
  event_id,
  name,
  description,
  price_czk,
  quantity_available,
  quantity_sold,
  active
)
select
  events.id,
  ticket.name,
  ticket.description,
  ticket.price_czk,
  250,
  0,
  true
from events
cross join (
  values
    ('Early Bird', 'First wave community access for early supporters.', 1000),
    ('Regular', 'Standard access to the full Naija to Prague celebration.', 1200),
    ('Late Registration', 'Final access tier when early spots are gone.', 1500),
    ('VIP', 'Premium access for guests who want the top-tier Owanbe feel.', 2500)
) as ticket(name, description, price_czk)
where events.slug = 'naija-to-prague-2026'
on conflict (event_id, name) do update set
  description = excluded.description,
  price_czk = excluded.price_czk,
  active = true;
