# Owanbe in Europe

Event ticketing platform built with Next.js, Vercel, and Supabase.

## Current MVP

- Premium public homepage for Owanbe in Europe: Naija to Prague.
- Event detail page with ticket tiers, event policy, and CTA.
- Checkout with separate buyer details and one attendee form per ticket.
- Server-side order creation with round-robin payment account assignment.
- Guest order lookup at `/my-ticket`.
- Finance v1 dashboard at `/finance` for approving pending orders.
- Check-in v1 page at `/checkin` for manual ticket-code lookup and entry.

## Payment Safety

Real IBANs and account-holder names must stay in Vercel server-side environment variables only. The frontend receives only the one assigned payment account for the buyer's order. Supabase stores `payment_account_label` such as `account_1`, not the real IBAN.

## Required Supabase Addition

The checkout stores attendee details before finance approval. Add this table if it does not exist yet:

```sql
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

create index if not exists order_attendees_order_id_idx on order_attendees(order_id);
```

Finance approval creates one `tickets` row per `order_attendees` row, then stores the generated `ticket_id` back on the attendee record.

## Flyer

Add the official event flyer as:

```text
public/hero-flyer.jpeg
```

Until that file exists, the website shows a premium flyer-inspired placeholder.
