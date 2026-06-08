import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { normalizeTicketCode } from '@/lib/orderUtils';

export async function POST(request: Request) {
  const payload = await request.json() as { ticketCode?: string };
  const ticketCode = normalizeTicketCode(payload.ticketCode || '');

  if (!ticketCode) {
    return NextResponse.json({ error: 'Ticket code is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('id, attendee_name, attendee_email, ticket_code, status, orders(order_number)')
    .eq('ticket_code', ticketCode)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}
