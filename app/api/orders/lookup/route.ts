import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getPaymentAccountByLabel, normalizeTicketCode, sanitizeEmail } from '@/lib/orderUtils';

const orderSelect = 'id, order_number, email, total_amount, payment_status, variable_symbol, payment_account_label, payment_qr_url, tickets(id, attendee_name, attendee_email, ticket_code, qr_code, qr_image_url, status)';

function paymentDetailsFromLabel(label?: string | null) {
  const account = getPaymentAccountByLabel(label);
  if (!account) return null;

  return {
    accountName: account.name,
    iban: account.iban,
    bic: account.bic,
    paymentAccountLabel: account.label
  };
}

export async function POST(request: Request) {
  const payload = await request.json() as { orderNumber?: string; email?: string; ticketCode?: string };
  const orderNumber = payload.orderNumber?.trim();
  const ticketCode = normalizeTicketCode(payload.ticketCode || '');
  const email = sanitizeEmail(payload.email || '');

  if (!orderNumber && !ticketCode) {
    return NextResponse.json({ error: 'Order number or ticket code is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (ticketCode) {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('id, attendee_name, attendee_email, ticket_code, qr_code, qr_image_url, status, orders(order_number, total_amount, payment_status, variable_symbol, payment_account_label, payment_qr_url)')
      .eq('ticket_code', ticketCode)
      .single();

    if (error || !ticket || !ticket.orders) {
      return NextResponse.json({ error: 'No ticket found for that ticket code.' }, { status: 404 });
    }

    const order = Array.isArray(ticket.orders) ? ticket.orders[0] : ticket.orders;
    const paymentDetails = paymentDetailsFromLabel(order.payment_account_label);

    return NextResponse.json({
      orderNumber: order.order_number,
      amountCzk: order.total_amount,
      paymentStatus: order.payment_status,
      variableSymbol: order.variable_symbol,
      paymentAccountLabel: order.payment_account_label,
      paymentQrUrl: order.payment_qr_url,
      ...paymentDetails,
      tickets: [{
        id: ticket.id,
        attendee_name: ticket.attendee_name,
        attendee_email: ticket.attendee_email,
        ticket_code: ticket.ticket_code,
        qr_code: ticket.qr_code,
        qr_image_url: ticket.qr_image_url,
        status: ticket.status
      }]
    });
  }

  let query = supabase
    .from('orders')
    .select(orderSelect)
    .eq('order_number', orderNumber);

  if (email) {
    query = query.eq('email', email);
  }

  const { data: order, error } = await query.single();

  if (error || !order) {
    return NextResponse.json({ error: 'No order found for those details.' }, { status: 404 });
  }

  const paymentDetails = paymentDetailsFromLabel(order.payment_account_label);

  return NextResponse.json({
    orderNumber: order.order_number,
    amountCzk: order.total_amount,
    paymentStatus: order.payment_status,
    variableSymbol: order.variable_symbol,
    paymentAccountLabel: order.payment_account_label,
    paymentQrUrl: order.payment_qr_url,
    ...paymentDetails,
    tickets: order.payment_status === 'paid' ? order.tickets : []
  });
}
