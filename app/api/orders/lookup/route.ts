import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sanitizeEmail } from '@/lib/orderUtils';

export async function POST(request: Request) {
  const payload = await request.json() as { orderNumber?: string; email?: string };
  const orderNumber = payload.orderNumber?.trim();
  const email = sanitizeEmail(payload.email || '');

  if (!orderNumber || !email) {
    return NextResponse.json({ error: 'Order number and email are required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, email, total_amount, payment_status, variable_symbol, payment_account_label, tickets(id, attendee_name, attendee_email, ticket_code, qr_code, status)')
    .eq('order_number', orderNumber)
    .eq('email', email)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'No order found for that order number and email.' }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.order_number,
    amountCzk: order.total_amount,
    paymentStatus: order.payment_status,
    variableSymbol: order.variable_symbol,
    paymentAccountLabel: order.payment_account_label,
    tickets: order.payment_status === 'paid' ? order.tickets : []
  });
}
