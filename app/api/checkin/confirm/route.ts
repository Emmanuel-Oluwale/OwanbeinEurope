import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { normalizeTicketCode } from '@/lib/orderUtils';
import { requireOrganizerRole } from '@/lib/organizerAuth';

export async function POST(request: Request) {
  const auth = await requireOrganizerRole(['checkin']);
  if (!auth.authorized) return auth.response;

  const payload = await request.json() as { ticketCode?: string; checkedInBy?: string };
  const ticketCode = normalizeTicketCode(payload.ticketCode || '');

  if (!ticketCode) {
    return NextResponse.json({ error: 'Ticket code is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('id, status')
    .eq('ticket_code', ticketCode)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
  }

  if (ticket.status !== 'valid') {
    return NextResponse.json({ error: `Ticket is ${ticket.status} and cannot be checked in.` }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from('tickets')
    .update({ status: 'used' })
    .eq('id', ticket.id);

  if (updateError) {
    return NextResponse.json({ error: 'Could not update ticket status.' }, { status: 500 });
  }

  const { error: checkinError } = await supabase.from('checkins').insert({
    ticket_id: ticket.id,
    checked_in_by: auth.organizer.email,
    checked_in_at: new Date().toISOString()
  });

  if (checkinError) {
    return NextResponse.json({ error: 'Ticket was marked used, but check-in audit could not be saved.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
