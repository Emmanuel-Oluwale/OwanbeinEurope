import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { sendBrevoEmail, ticketReadyHtml } from '@/lib/brevo';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { makeTicketCode } from '@/lib/orderUtils';
import { requireOrganizerRole } from '@/lib/organizerAuth';

export async function POST(request: Request) {
  const auth = await requireOrganizerRole(['finance']);
  if (!auth.authorized) return auth.response;

  const payload = await request.json() as { orderId?: string };

  if (!payload.orderId) {
    return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_number, full_name, email, payment_status, order_attendees(id, ticket_type_id, attendee_name, attendee_email, ticket_id)')
    .eq('id', payload.orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const attendees = order.order_attendees || [];
  if (!attendees.length) {
    return NextResponse.json({ error: 'Order has no attendee records.' }, { status: 400 });
  }

  const { data: existingTickets, error: existingTicketsError } = await supabase
    .from('tickets')
    .select('id, ticket_code, ticket_type_id')
    .eq('order_id', order.id);

  if (existingTicketsError) {
    return NextResponse.json({ error: 'Could not check existing tickets.' }, { status: 500 });
  }

  const hasLinkedTickets = attendees.some((attendee) => Boolean(attendee.ticket_id));
  const hasExistingTickets = Boolean(existingTickets && existingTickets.length > 0);

  if (order.payment_status === 'paid' || hasLinkedTickets || hasExistingTickets) {
    if (order.payment_status !== 'paid') {
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', approved_by: auth.organizer.email, approved_at: new Date().toISOString() })
        .eq('id', order.id);
    }

    return NextResponse.json({ ok: true, tickets: existingTickets || [] });
  }

  const ticketRows = await Promise.all(attendees.map(async (attendee, index) => {
    const ticketCode = makeTicketCode(order.order_number, index);
    return {
      order_id: order.id,
      ticket_type_id: attendee.ticket_type_id,
      attendee_name: attendee.attendee_name,
      attendee_email: attendee.attendee_email,
      ticket_code: ticketCode,
      qr_code: await QRCode.toDataURL(ticketCode, { margin: 1, width: 320 }),
      status: 'valid'
    };
  }));

  const { data: tickets, error: ticketError } = await supabase
    .from('tickets')
    .insert(ticketRows)
    .select('id, ticket_code, ticket_type_id');

  if (ticketError || !tickets) {
    return NextResponse.json({ error: 'Could not issue tickets.' }, { status: 500 });
  }

  await Promise.all(tickets.map((ticket, index) => supabase
    .from('order_attendees')
    .update({ ticket_id: ticket.id })
    .eq('id', attendees[index].id)));

  const soldByTicketType = attendees.reduce<Record<string, number>>((acc, attendee) => {
    acc[attendee.ticket_type_id] = (acc[attendee.ticket_type_id] || 0) + 1;
    return acc;
  }, {});

  for (const [ticketTypeId, soldCount] of Object.entries(soldByTicketType)) {
    const { data: ticketType, error: ticketTypeError } = await supabase
      .from('ticket_types')
      .select('quantity_sold')
      .eq('id', ticketTypeId)
      .single();

    if (ticketTypeError || !ticketType) {
      return NextResponse.json({ error: 'Tickets were issued, but inventory could not be loaded.' }, { status: 500 });
    }

    const { error: inventoryError } = await supabase
      .from('ticket_types')
      .update({ quantity_sold: Number(ticketType.quantity_sold || 0) + soldCount })
      .eq('id', ticketTypeId);

    if (inventoryError) {
      return NextResponse.json({ error: 'Tickets were issued, but inventory could not be updated.' }, { status: 500 });
    }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ payment_status: 'paid', approved_by: auth.organizer.email, approved_at: new Date().toISOString() })
    .eq('id', order.id);

  if (updateError) {
    return NextResponse.json({ error: 'Tickets were created, but order approval status could not be saved.' }, { status: 500 });
  }

  try {
    await sendBrevoEmail({
      to: order.email,
      toName: order.full_name,
      subject: `Your Owanbe in Europe ticket is ready`,
      emailType: 'ticket_ready',
      orderId: order.id,
      html: ticketReadyHtml({
        name: order.full_name,
        orderNumber: order.order_number,
        ticketCodes: tickets.map((ticket) => ticket.ticket_code)
      })
    });
  } catch (emailError) {
    console.error('Ticket-ready email failed', emailError);
  }

  return NextResponse.json({ ok: true, tickets });
}
