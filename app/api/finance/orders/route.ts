import { NextResponse } from 'next/server';
import { getAssignedFinanceHandler } from '@/lib/financeAccess';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireOrganizerRole } from '@/lib/organizerAuth';

export async function GET(request: Request) {
  const auth = await requireOrganizerRole(['finance']);
  if (!auth.authorized) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending';
  const isAdmin = auth.organizer.role === 'admin';
  const assignedHandler = getAssignedFinanceHandler(auth.organizer.email);

  if (!isAdmin && !assignedHandler) {
    return NextResponse.json({
      orders: [],
      scope: {
        email: auth.organizer.email,
        role: auth.organizer.role,
        handler: null,
        isAdmin: false
      },
      warning: 'Your finance account is not linked to a payment handler yet.'
    });
  }

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('orders')
    .select('id, created_at, approved_at, approved_by, order_number, full_name, email, phone, total_amount, payment_status, variable_symbol, payment_account_label, order_attendees(id, attendee_name, attendee_email, attendee_phone), tickets(ticket_code, attendee_name, attendee_email, status)')
    .order(status === 'pending' ? 'created_at' : 'approved_at', { ascending: status === 'pending', nullsFirst: false });

  if (['pending', 'paid', 'cancelled', 'refunded'].includes(status)) {
    query = query.eq('payment_status', status);
  }

  if (!isAdmin && assignedHandler) {
    query = query.eq('payment_account_label', assignedHandler);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Could not load finance orders.' }, { status: 500 });
  }

  return NextResponse.json({
    orders: data || [],
    status,
    scope: {
      email: auth.organizer.email,
      role: auth.organizer.role,
      handler: assignedHandler,
      isAdmin
    }
  });
}
