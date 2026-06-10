'use client';

import { useEffect, useState } from 'react';
import { OrganizerGate } from '@/app/components/OrganizerGate';

type LiveData = {
  error?: string;
  summary?: {
    confirmedRevenue: number;
    pendingRevenue: number;
    pendingOrders: number;
    paidOrders: number;
    ticketsIssued: number;
    checkedIn: number;
  };
  handlerBreakdown?: Array<{ handler: string; pending: number; paid: number; revenue: number }>;
  ticketTypeBreakdown?: Array<{ id: string; name: string; quantitySold: number; remaining: number }>;
};

function money(value?: number) {
  return `${Number(value || 0).toLocaleString('cs-CZ')} CZK`;
}

export default function LiveDashboardPage() {
  const [data, setData] = useState<LiveData>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function loadLiveData() {
    const response = await fetch('/api/admin/analytics', { cache: 'no-store' });
    setData(await response.json());
    setLastUpdated(new Date());
    setLoading(false);
  }

  useEffect(() => {
    loadLiveData();
    const interval = window.setInterval(loadLiveData, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const summary = data.summary;
  const checkinRate = summary?.ticketsIssued ? Math.round((summary.checkedIn / summary.ticketsIssued) * 100) : 0;

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/organizer">Owanbe Live</a>
          <div className="nav-links">
            <a href="/admin/analytics">Analytics</a>
            <a href="/checkin">Check-in</a>
            <button className="button secondary compact" type="button" onClick={loadLiveData}>Refresh</button>
          </div>
        </nav>
      </header>

      <OrganizerGate area="admin" nextPath="/admin/live">
        <section className="section">
          <div className="container">
            <p className="kicker">Event-Day Operations</p>
            <h1 className="section-title">Live dashboard.</h1>
            <p className="muted">Auto-refreshes every 30 seconds. Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading'}</p>

            {loading ? (
              <div className="result-box">Loading live dashboard...</div>
            ) : data.error ? (
              <div className="result-box error">{data.error}</div>
            ) : (
              <>
                <div className="grid four">
                  <article className="card"><p className="kicker">Revenue</p><h3>{money(summary?.confirmedRevenue)}</h3><p className="muted">{summary?.paidOrders || 0} paid orders</p></article>
                  <article className="card"><p className="kicker">Pending</p><h3>{money(summary?.pendingRevenue)}</h3><p className="muted">{summary?.pendingOrders || 0} payments waiting</p></article>
                  <article className="card"><p className="kicker">Tickets Issued</p><h3>{summary?.ticketsIssued || 0}</h3><p className="muted">Ready for guests</p></article>
                  <article className="card"><p className="kicker">Checked In</p><h3>{summary?.checkedIn || 0}</h3><p className="muted">{checkinRate}% of issued tickets</p></article>
                </div>

                <div className="grid two">
                  <section className="summary-panel">
                    <p className="kicker">Ticket Flow</p>
                    <div className="payment-details">
                      {(data.ticketTypeBreakdown || []).map((ticket) => (
                        <p key={ticket.id}><span>{ticket.name}</span><strong>{ticket.quantitySold} sold, {ticket.remaining} remaining</strong></p>
                      ))}
                    </div>
                  </section>

                  <section className="summary-panel">
                    <p className="kicker">Handler Queue</p>
                    <div className="payment-details">
                      {(data.handlerBreakdown || []).map((handler) => (
                        <p key={handler.handler}><span>{handler.handler}</span><strong>{handler.pending} pending, {handler.paid} approved</strong></p>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>
        </section>
      </OrganizerGate>
    </main>
  );
}
