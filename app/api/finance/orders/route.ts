import { NextResponse } from 'next/server';
import { getAssignedFinanceHandler } from '@/lib/financeAccess';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireOrganizerRole } from '@/lib/organizerAuth';

export async function GET() {
  const auth = await requireOrganizerRole(['finance']);
  if (!auth.authorized) return auth.response;

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
    .select('id, created_at, order_number, full_name, email, phone, total_amount, payment_status, variable_symbol, payment_account_label, order_attendees(id, attendee_name, attendee_email, attendee_phone)')
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: true });

  if (!isAdmin && assignedHandler) {
    query = query.eq('payment_account_label', assignedHandler);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Could not load pending orders.' }, { status: 500 });
  }

  return NextResponse.json({
    orders: data || [],
    scope: {
      email: auth.organizer.email,
      role: auth.organizer.role,
      handler: assignedHandler,
      isAdmin
    }
  });
}
