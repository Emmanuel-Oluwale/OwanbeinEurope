'use client';

import { useEffect, useState } from 'react';
import { OrganizerGate } from '@/app/components/OrganizerGate';

type AnalyticsData = {
  error?: string;
  summary?: {
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    cancelledOrders: number;
    confirmedRevenue: number;
    pendingRevenue: number;
    approvedToday: number;
    revenueToday: number;
    ticketsIssued: number;
    checkedIn: number;
    emailAttempts: number;
  };
  ticketTypeBreakdown?: Array<{
    id: string;
    name: string;
    priceCzk: number;
    quantityAvailable: number;
    quantitySold: number;
    remaining: number;
    active: boolean;
  }>;
  handlerBreakdown?: Array<{
    handler: string;
    pending: number;
    paid: number;
    revenue: number;
  }>;
  emailBreakdown?: Array<{
    key: string;
    sent: number;
    failed: number;
    skipped: number;
    total: number;
  }>;
  recentPaidOrders?: Array<{
    order_number: string;
    total_amount: number;
    payment_account_label: string;
    approved_at: string | null;
    created_at: string;
  }>;
};

function money(value?: number) {
  return `${Number(value || 0).toLocaleString('cs-CZ')} CZK`;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    setLoading(true);
    const response = await fetch('/api/admin/analytics');
    setData(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const summary = data.summary;

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/organizer">Owanbe Analytics</a>
          <div className="nav-links">
            <a href="/organizer">Organizer</a>
            <a href="/admin/settings">Settings</a>
            <button className="button secondary compact" type="button" onClick={loadAnalytics}>Refresh</button>
          </div>
        </nav>
      </header>

      <OrganizerGate area="admin" nextPath="/admin/analytics">
        <section className="section">
          <div className="container">
            <p className="kicker">Admin Analytics</p>
            <h1 className="section-title">Event performance dashboard.</h1>
            <p className="muted">Revenue, tickets, handlers, email activity, and recent paid orders.</p>

            {loading ? (
              <div className="result-box">Loading analytics...</div>
            ) : data.error ? (
              <div className="result-box error">{data.error}</div>
            ) : (
              <>
                <div className="grid four">
                  <article className="card"><p className="kicker">Total Revenue</p><h3>{money(summary?.confirmedRevenue)}</h3><p className="muted">{summary?.paidOrders || 0} paid orders</p></article>
                  <article className="card"><p className="kicker">Revenue Today</p><h3>{money(summary?.revenueToday)}</h3><p className="muted">{summary?.approvedToday || 0} approvals today</p></article>
                  <article className="card"><p className="kicker">Pending Revenue</p><h3>{money(summary?.pendingRevenue)}</h3><p className="muted">{summary?.pendingOrders || 0} pending orders</p></article>
                  <article className="card"><p className="kicker">Check-ins</p><h3>{summary?.checkedIn || 0}</h3><p className="muted">{summary?.ticketsIssued || 0} tickets issued</p></article>
                </div>

                <div className="grid four">
                  <article className="card"><p className="kicker">Total Orders</p><h3>{summary?.totalOrders || 0}</h3><p className="muted">{summary?.cancelledOrders || 0} cancelled</p></article>
                  <article className="card"><p className="kicker">Email Attempts</p><h3>{summary?.emailAttempts || 0}</h3><p className="muted">Payment and ticket emails</p></article>
                  <article className="card"><p className="kicker">Paid Orders</p><h3>{summary?.paidOrders || 0}</h3><p className="muted">Confirmed by finance</p></article>
                  <article className="card"><p className="kicker">Pending Orders</p><h3>{summary?.pendingOrders || 0}</h3><p className="muted">Awaiting payment review</p></article>
                </div>

                <section className="summary-panel">
                  <p className="kicker">Ticket Type Breakdown</p>
                  <div className="grid four">
                    {(data.ticketTypeBreakdown || []).map((ticket) => (
                      <article className="card" key={ticket.id}>
                        <h3>{ticket.name}</h3>
                        <div className="payment-details">
                          <p><span>Sold</span><strong>{ticket.quantitySold}</strong></p>
                          <p><span>Remaining</span><strong>{ticket.remaining}</strong></p>
                          <p><span>Revenue</span><strong>{money(ticket.quantitySold * ticket.priceCzk)}</strong></p>
                          <p><span>Status</span><strong>{ticket.active ? 'Active' : 'Inactive'}</strong></p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <div className="grid two">
                  <section className="summary-panel">
                    <p className="kicker">Handler Performance</p>
                    <div className="payment-details">
                      {(data.handlerBreakdown || []).map((handler) => (
                        <p key={handler.handler}>
                          <span>{handler.handler}</span>
                          <strong>{handler.pending} pending, {handler.paid} approved, {money(handler.revenue)}</strong>
                        </p>
                      ))}
                    </div>
                  </section>

                  <section className="summary-panel">
                    <p className="kicker">Email Analytics</p>
                    <div className="payment-details">
                      {(data.emailBreakdown || []).map((email) => (
                        <p key={email.key}>
                          <span>{email.key}</span>
                          <strong>{email.sent} sent, {email.failed} failed, {email.skipped} skipped</strong>
                        </p>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="summary-panel">
                  <p className="kicker">Recent Paid Orders</p>
                  <div className="payment-details">
                    {(data.recentPaidOrders || []).map((order) => (
                      <p key={order.order_number}>
                        <span>{order.order_number}</span>
                        <strong>{money(order.total_amount)} - {order.payment_account_label || 'Unassigned'} - {new Date(order.approved_at || order.created_at).toLocaleString()}</strong>
                      </p>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      </OrganizerGate>
    </main>
  );
}
