import { NextResponse } from 'next/server';
import { sendBrevoEmail, ticketReadyHtml } from '@/lib/brevo';
import { canAccessFinanceOrder } from '@/lib/financeAccess';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireOrganizerRole } from '@/lib/organizerAuth';

export async function POST(request: Request) {
  const auth = await requireOrganizerRole(['finance']);
  if (!auth.authorized) return auth.response;

  const payload = await request.json() as { orderId?: string; orderNumber?: string };
  if (!payload.orderId && !payload.orderNumber) {
    return NextResponse.json({ error: 'Order ID or order number is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('orders')
    .select('id, order_number, full_name, email, payment_status, payment_account_label, tickets(ticket_code, attendee_name, qr_image_url)');

  if (payload.orderId) {
    query = query.eq('id', payload.orderId);
  } else {
    query = query.eq('order_number', payload.orderNumber?.trim());
  }

  const { data: order, error } = await query.single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  if (!canAccessFinanceOrder({
    organizerEmail: auth.organizer.email,
    organizerRole: auth.organizer.role,
    orderHandler: order.payment_account_label
  })) {
    return NextResponse.json({ error: 'You cannot resend tickets for this order.' }, { status: 403 });
  }

  const tickets = Array.isArray(order.tickets) ? order.tickets : [];
  if (order.payment_status !== 'paid' || tickets.length === 0) {
    return NextResponse.json({ error: 'Tickets are not available for this order yet.' }, { status: 409 });
  }

  await sendBrevoEmail({
    to: order.email,
    toName: order.full_name,
    subject: `Your Owanbe in Europe ticket is ready`,
    emailType: 'ticket_ready_resend',
    orderId: order.id,
    html: ticketReadyHtml({
      name: order.full_name,
      orderNumber: order.order_number,
      ticketCodes: tickets.map((ticket) => ticket.ticket_code),
      attendeeNames: tickets.map((ticket) => ticket.attendee_name),
      ticketQrUrls: tickets.map((ticket) => ticket.qr_image_url),
      ticketLinks: tickets.map((ticket) => `https://owanbeineurope.cz/my-ticket?ticket=${encodeURIComponent(ticket.ticket_code)}`)
    })
  });

  return NextResponse.json({ ok: true, message: `Ticket email resent to ${order.email}.` });
}
