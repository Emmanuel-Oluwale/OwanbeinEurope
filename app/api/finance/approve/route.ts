import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { makeTicketCode } from '@/lib/orderUtils';

export async function POST(request: Request) {
  const payload = await request.json() as { orderId?: string; approvedBy?: string };

  if (!payload.orderId) {
    return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_number, payment_status, order_attendees(id, ticket_type_id, attendee_name, attendee_email, ticket_id)')
    .eq('id', payload.orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  if (order.payment_status === 'paid') {
    return NextResponse.json({ error: 'Order is already paid.' }, { status: 409 });
  }

  const attendees = order.order_attendees || [];
  if (!attendees.length) {
    return NextResponse.json({ error: 'Order has no attendee records.' }, { status: 400 });
  }

  const ticketRows = await Promise.all(attendees.map(async (attendee, index) => {
    const ticketCode = makeTicketCode(order.order_number, index);
    const checkinUrl = `https://owanbeineurope.cz/checkin?ticket=${encodeURIComponent(ticketCode)}`;
    return {
      order_id: order.id,
      ticket_type_id: attendee.ticket_type_id,
      attendee_name: attendee.attendee_name,
      attendee_email: attendee.attendee_email,
      ticket_code: ticketCode,
      qr_code: await QRCode.toDataURL(checkinUrl, { margin: 1, width: 320 }),
      status: 'valid'
    };
  }));

  const { data: tickets, error: ticketError } = await supabase
    .from('tickets')
    .insert(ticketRows)
    .select('id, ticket_code');

  if (ticketError || !tickets) {
    return NextResponse.json({ error: 'Could not issue tickets.' }, { status: 500 });
  }

  await Promise.all(tickets.map((ticket, index) => supabase
    .from('order_attendees')
    .update({ ticket_id: ticket.id })
    .eq('id', attendees[index].id)));

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      approved_by: payload.approvedBy?.trim() || 'finance',
      approved_at: new Date().toISOString()
    })
    .eq('id', order.id);

  if (updateError) {
    return NextResponse.json({ error: 'Tickets were created, but order approval status could not be saved.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, tickets });
}
