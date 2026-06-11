import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireOrganizerRole } from '@/lib/organizerAuth';

export async function GET() {
  const auth = await requireOrganizerRole(['checkin']);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabaseAdmin();
  const [ticketsResult, checkinsResult] = await Promise.all([
    supabase
      .from('tickets')
      .select('id, status, attendee_name, attendee_email, ticket_code, ticket_types(name)'),
    supabase
      .from('checkins')
      .select('id, checked_in_at, checked_in_by, tickets(ticket_code, attendee_name, attendee_email)')
      .order('checked_in_at', { ascending: false })
      .limit(10)
  ]);

  const firstError = ticketsResult.error || checkinsResult.error;
  if (firstError) {
    return NextResponse.json({ error: 'Could not load check-in stats.' }, { status: 500 });
  }

  const tickets = ticketsResult.data || [];
  const issued = tickets.length;
  const checkedIn = tickets.filter((ticket) => ticket.status === 'used').length;
  const valid = tickets.filter((ticket) => ticket.status === 'valid').length;
  const cancelled = tickets.filter((ticket) => ticket.status === 'cancelled' || ticket.status === 'refunded').length;

  const byTier = tickets.reduce<Record<string, { name: string; issued: number; checkedIn: number; remaining: number }>>((acc, ticket) => {
    const ticketType = Array.isArray(ticket.ticket_types) ? ticket.ticket_types[0] : ticket.ticket_types;
    const name = ticketType?.name || 'Unassigned';
    if (!acc[name]) acc[name] = { name, issued: 0, checkedIn: 0, remaining: 0 };
    acc[name].issued += 1;
    if (ticket.status === 'used') acc[name].checkedIn += 1;
    if (ticket.status === 'valid') acc[name].remaining += 1;
    return acc;
  }, {});

  return NextResponse.json({
    summary: {
      issued,
      checkedIn,
      valid,
      cancelled,
      checkinRate: issued ? Math.round((checkedIn / issued) * 100) : 0
    },
    byTier: Object.values(byTier),
    recent: (checkinsResult.data || []).map((checkin) => {
      const ticket = Array.isArray(checkin.tickets) ? checkin.tickets[0] : checkin.tickets;
      return {
        checkedInAt: checkin.checked_in_at,
        checkedInBy: checkin.checked_in_by,
        ticketCode: ticket?.ticket_code,
        attendeeName: ticket?.attendee_name,
        attendeeEmail: ticket?.attendee_email
      };
    })
  });
}
