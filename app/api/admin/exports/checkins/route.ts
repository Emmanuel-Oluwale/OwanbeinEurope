import { csvResponse, toCsv } from '@/lib/csv';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireOrganizerRole } from '@/lib/organizerAuth';

export async function GET() {
  const auth = await requireOrganizerRole(['admin']);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('checkins')
    .select('checked_in_at, checked_in_by, tickets(ticket_code, attendee_name, attendee_email, status, orders(order_number))')
    .order('checked_in_at', { ascending: false });

  if (error) {
    return Response.json({ error: 'Could not export check-ins.' }, { status: 500 });
  }

  const csv = toCsv([
    'Ticket',
    'Guest Name',
    'Guest Email',
    'Order Number',
    'Ticket Status',
    'Checked In By',
    'Check-In Time'
  ], (data || []).map((checkin) => {
    const ticket = firstJoined(checkin.tickets);
    const order = firstJoined(ticket?.orders);

    return [
      ticket?.ticket_code,
      ticket?.attendee_name,
      ticket?.attendee_email,
      order?.order_number,
      ticket?.status,
      checkin.checked_in_by,
      checkin.checked_in_at
    ];
  }));

  return csvResponse(`owanbe-checkins-${dateStamp()}.csv`, csv);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}
