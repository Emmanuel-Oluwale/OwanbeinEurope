import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, order_number, full_name, email, phone, total_amount, payment_status, variable_symbol, payment_account_label, order_attendees(id, attendee_name, attendee_email, attendee_phone)')
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Could not load pending orders.' }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}
