import { csvResponse, toCsv } from '@/lib/csv';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireOrganizerRole } from '@/lib/organizerAuth';

export async function GET() {
  const auth = await requireOrganizerRole(['admin']);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('order_attendees')
    .select('attendee_name, attendee_email, attendee_phone, ticket_types(name), tickets(ticket_code, status), orders(order_number, payment_status, created_at)')
    .order('attendee_name', { ascending: true });

  if (error) {
    return Response.json({ error: 'Could not export attendees.' }, { status: 500 });
  }

  const csv = toCsv([
    'Name',
    'Email',
    'Phone',
    'Ticket Type',
    'Ticket Code',
    'Ticket Status',
    'Order Number',
    'Payment Status',
    'Order Created At'
  ], (data || []).map((attendee) => {
    const ticketType = firstJoined(attendee.ticket_types);
    const ticket = firstJoined(attendee.tickets);
    const order = firstJoined(attendee.orders);

    return [
      attendee.attendee_name,
      attendee.attendee_email,
      attendee.attendee_phone,
      ticketType?.name,
      ticket?.ticket_code,
      ticket?.status,
      order?.order_number,
      order?.payment_status,
      order?.created_at
    ];
  }));

  return csvResponse(`owanbe-attendees-${dateStamp()}.csv`, csv);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}
