import { csvResponse, toCsv } from '@/lib/csv';
import { canAccessFinanceOrder, getAssignedFinanceHandler } from '@/lib/financeAccess';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireOrganizerRole } from '@/lib/organizerAuth';

export async function GET() {
  const auth = await requireOrganizerRole(['finance']);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('order_number, full_name, email, phone, total_amount, payment_status, variable_symbol, payment_account_label, approved_by, approved_at, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: 'Could not export finance orders.' }, { status: 500 });
  }

  const assignedHandler = getAssignedFinanceHandler(auth.organizer.email);
  const visibleOrders = (data || []).filter((order) => canAccessFinanceOrder({
    organizerEmail: auth.organizer.email,
    organizerRole: auth.organizer.role,
    orderHandler: order.payment_account_label
  }));

  if (auth.organizer.role !== 'admin' && !assignedHandler) {
    return Response.json({ error: 'Your finance account is not linked to a payment handler yet.' }, { status: 403 });
  }

  const csv = toCsv([
    'Order Number',
    'Buyer Name',
    'Buyer Email',
    'Buyer Phone',
    'Amount CZK',
    'Assigned Handler',
    'Variable Symbol',
    'Status',
    'Approved By',
    'Approved At',
    'Created At'
  ], visibleOrders.map((order) => [
    order.order_number,
    order.full_name,
    order.email,
    order.phone,
    order.total_amount,
    order.payment_account_label,
    order.variable_symbol,
    order.payment_status,
    order.approved_by,
    order.approved_at,
    order.created_at
  ]));

  return csvResponse(`owanbe-finance-${dateStamp()}.csv`, csv);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}
