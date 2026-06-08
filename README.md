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

## Supabase Setup

Run the SQL file below in Supabase SQL Editor when you are ready:

```text
supabase/setup.sql
```

Finance approval creates one `tickets` row per `order_attendees` row, then stores the generated `ticket_id` back on the attendee record.

## Flyer

Add the official event flyer as:

```text
public/hero-flyer.jpeg
```

Until that file exists, the website shows a premium flyer-inspired placeholder.
