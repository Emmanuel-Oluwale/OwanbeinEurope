import { NextResponse } from 'next/server';
import { getPaymentAccountByLabel, sanitizeEmail } from '@/lib/orderUtils';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  const payload = await request.json() as { email?: string };
  const email = sanitizeEmail(payload.email || '');

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, order_number, full_name, email, total_amount, payment_status, variable_symbol, payment_account_label, payment_qr_url, tickets(attendee_name, attendee_email, ticket_code, qr_image_url, status)')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load orders.' }, { status: 500 });
  }

  const orders = (data || []).map((order) => {
    const account = getPaymentAccountByLabel(order.payment_account_label);
    return {
      createdAt: order.created_at,
      orderNumber: order.order_number,
      buyerName: order.full_name,
      amountCzk: Number(order.total_amount || 0),
      paymentStatus: order.payment_status,
      variableSymbol: order.variable_symbol,
      paymentAccountLabel: order.payment_account_label,
      paymentQrUrl: order.payment_qr_url,
      accountName: account?.name || order.payment_account_label,
      iban: account?.iban || null,
      bic: account?.bic || null,
      orderUrl: `/my-ticket?order=${encodeURIComponent(order.order_number)}`,
      tickets: order.payment_status === 'paid'
        ? (order.tickets || []).map((ticket) => ({
            attendeeName: ticket.attendee_name,
            attendeeEmail: ticket.attendee_email,
            ticketCode: ticket.ticket_code,
            qrImageUrl: ticket.qr_image_url,
            status: ticket.status,
            ticketUrl: `/my-ticket?ticket=${encodeURIComponent(ticket.ticket_code)}`
          }))
        : []
    };
  });

  return NextResponse.json({ orders });
}
