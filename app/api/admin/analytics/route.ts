import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireOrganizerRole } from '@/lib/organizerAuth';

export async function GET() {
  const auth = await requireOrganizerRole(['admin']);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabaseAdmin();

  const [ordersResult, ticketsResult, ticketTypesResult, checkinsResult, emailsResult] = await Promise.all([
    supabase
      .from('orders')
      .select('id, created_at, order_number, total_amount, payment_status, payment_account_label, approved_by, approved_at'),
    supabase
      .from('tickets')
      .select('id, created_at, ticket_type_id, status, ticket_types(name, price_czk)'),
    supabase
      .from('ticket_types')
      .select('id, name, price_czk, quantity_available, quantity_sold, active')
      .order('price_czk', { ascending: true }),
    supabase
      .from('checkins')
      .select('id, created_at, ticket_id'),
    supabase
      .from('email_logs')
      .select('id, created_at, email_type, status')
  ]);

  const firstError = ordersResult.error || ticketsResult.error || ticketTypesResult.error || checkinsResult.error || emailsResult.error;
  if (firstError) {
    return NextResponse.json({ error: 'Could not load analytics.' }, { status: 500 });
  }

  const orders = ordersResult.data || [];
  const tickets = ticketsResult.data || [];
  const ticketTypes = ticketTypesResult.data || [];
  const checkins = checkinsResult.data || [];
  const emails = emailsResult.data || [];

  const paidOrders = orders.filter((order) => order.payment_status === 'paid');
  const pendingOrders = orders.filter((order) => order.payment_status === 'pending');
  const cancelledOrders = orders.filter((order) => order.payment_status === 'cancelled');
  const confirmedRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const pendingRevenue = pendingOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const approvedToday = paidOrders.filter((order) => order.approved_at && order.approved_at >= todayStart);
  const revenueToday = approvedToday.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  const ticketTypeBreakdown = ticketTypes.map((ticketType) => {
    const soldFromTickets = tickets.filter((ticket) => ticket.ticket_type_id === ticketType.id).length;
    const sold = Number(ticketType.quantity_sold || soldFromTickets || 0);
    const available = Number(ticketType.quantity_available || 0);
    return {
      id: ticketType.id,
      name: ticketType.name,
      priceCzk: Number(ticketType.price_czk || 0),
      quantityAvailable: available,
      quantitySold: sold,
      remaining: Math.max(available - sold, 0),
      active: ticketType.active
    };
  });

  const handlerBreakdown = orders.reduce<Record<string, { handler: string; pending: number; paid: number; revenue: number }>>((acc, order) => {
    const handler = order.payment_account_label || 'Unassigned';
    if (!acc[handler]) acc[handler] = { handler, pending: 0, paid: 0, revenue: 0 };
    if (order.payment_status === 'pending') acc[handler].pending += 1;
    if (order.payment_status === 'paid') {
      acc[handler].paid += 1;
      acc[handler].revenue += Number(order.total_amount || 0);
    }
    return acc;
  }, {});

  const emailBreakdown = emails.reduce<Record<string, { key: string; sent: number; failed: number; skipped: number; total: number }>>((acc, email) => {
    const key = email.email_type || 'unknown';
    if (!acc[key]) acc[key] = { key, sent: 0, failed: 0, skipped: 0, total: 0 };
    acc[key].total += 1;
    if (email.status === 'sent') acc[key].sent += 1;
    if (email.status === 'failed') acc[key].failed += 1;
    if (email.status === 'skipped') acc[key].skipped += 1;
    return acc;
  }, {});

  return NextResponse.json({
    summary: {
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      paidOrders: paidOrders.length,
      cancelledOrders: cancelledOrders.length,
      confirmedRevenue,
      pendingRevenue,
      approvedToday: approvedToday.length,
      revenueToday,
      ticketsIssued: tickets.length,
      checkedIn: checkins.length,
      emailAttempts: emails.length
    },
    ticketTypeBreakdown,
    handlerBreakdown: Object.values(handlerBreakdown),
    emailBreakdown: Object.values(emailBreakdown),
    recentPaidOrders: paidOrders
      .sort((a, b) => String(b.approved_at || b.created_at).localeCompare(String(a.approved_at || a.created_at)))
      .slice(0, 10)
  });
}
