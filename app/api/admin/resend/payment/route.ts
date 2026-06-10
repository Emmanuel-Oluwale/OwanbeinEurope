import { NextResponse } from 'next/server';
import { paymentInstructionsHtml, sendBrevoEmail } from '@/lib/brevo';
import { canAccessFinanceOrder } from '@/lib/financeAccess';
import { getPaymentAccountByLabel } from '@/lib/orderUtils';
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
    .select('id, order_number, full_name, email, total_amount, payment_status, variable_symbol, payment_account_label, payment_qr_url');

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
    return NextResponse.json({ error: 'You cannot resend email for this order.' }, { status: 403 });
  }

  const account = getPaymentAccountByLabel(order.payment_account_label);
  if (!account) {
    return NextResponse.json({ error: 'Payment account details could not be loaded.' }, { status: 500 });
  }

  await sendBrevoEmail({
    to: order.email,
    toName: order.full_name,
    subject: `Payment instructions for ${order.order_number}`,
    emailType: 'payment_instructions_resend',
    orderId: order.id,
    html: paymentInstructionsHtml({
      name: order.full_name,
      orderNumber: order.order_number,
      amountCzk: Number(order.total_amount || 0),
      variableSymbol: order.variable_symbol,
      accountName: account.name,
      iban: account.iban,
      bic: account.bic,
      paymentQrUrl: order.payment_qr_url,
      orderLookupUrl: `https://owanbeineurope.cz/my-ticket?order=${encodeURIComponent(order.order_number)}`
    })
  });

  return NextResponse.json({ ok: true, message: `Payment instructions resent to ${order.email}.` });
}
