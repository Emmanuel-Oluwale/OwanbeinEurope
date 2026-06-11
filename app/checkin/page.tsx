'use client';

import { useEffect, useState } from 'react';
import { OrganizerGate } from '@/app/components/OrganizerGate';

type TicketResult = {
  error?: string;
  ticket?: {
    attendee_name: string;
    attendee_email: string;
    ticket_code: string;
    status: string;
  };
  ok?: boolean;
};

type CheckinStats = {
  error?: string;
  summary?: {
    issued: number;
    checkedIn: number;
    valid: number;
    cancelled: number;
    checkinRate: number;
  };
  byTier?: Array<{ name: string; issued: number; checkedIn: number; remaining: number }>;
  recent?: Array<{
    checkedInAt: string;
    checkedInBy: string;
    ticketCode: string;
    attendeeName: string;
    attendeeEmail: string;
  }>;
};

export default function CheckinPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [result, setResult] = useState<TicketResult | null>(null);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<CheckinStats | null>(null);

  async function loadStats() {
    const response = await fetch('/api/checkin/stats');
    setStats(await response.json());
  }

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/checkin/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketCode })
    });
    setResult(await response.json());
  }

  async function confirm() {
    setMessage('Checking in...');
    const response = await fetch('/api/checkin/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketCode, checkedInBy: 'checkin' })
    });
    const data = await response.json();
    setMessage(data.error || 'Checked in successfully.');
    if (!data.error) {
      setResult((current) => current?.ticket ? { ticket: { ...current.ticket, status: 'used' } } : current);
      await loadStats();
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe Check-in</a>
          <a className="button secondary compact" href="/finance">Finance</a>
        </nav>
      </header>
      <OrganizerGate area="checkin">
        <section className="section">
          <div className="container grid two">
            <div>
              <p className="kicker">Check-in v1</p>
              <h1 className="section-title">Manual ticket code lookup.</h1>
              <p className="muted">QR scanning can be added later. For launch, paste or type the ticket code and confirm entry.</p>
              <div className="grid two">
                <article className="card">
                  <p className="kicker">Checked In</p>
                  <h3>{stats?.summary?.checkedIn || 0}</h3>
                  <p className="muted">{stats?.summary?.checkinRate || 0}% of issued tickets</p>
                </article>
                <article className="card">
                  <p className="kicker">Remaining</p>
                  <h3>{stats?.summary?.valid || 0}</h3>
                  <p className="muted">{stats?.summary?.issued || 0} issued total</p>
                </article>
              </div>
              {stats?.byTier?.length ? (
                <div className="summary-panel">
                  <p className="kicker">By Ticket Tier</p>
                  <div className="payment-details">
                    {stats.byTier.map((tier) => (
                      <p key={tier.name}><span>{tier.name}</span><strong>{tier.checkedIn} in, {tier.remaining} remaining</strong></p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <form className="checkout-form" onSubmit={lookup}>
              <label className="field-label">Ticket code</label>
              <input className="field" required value={ticketCode} onChange={(event) => setTicketCode(event.target.value)} placeholder="OIE-TICKET-..." />
              <button className="button primary submit-button" type="submit">Lookup Ticket</button>
              {message && <div className="result-box">{message}</div>}
              {result?.error && <div className="result-box error">{result.error}</div>}
              {result?.ticket && (
                <div className="result-box">
                  <p className="kicker">{result.ticket.ticket_code}</p>
                  <h3>{result.ticket.attendee_name}</h3>
                  <p>{result.ticket.attendee_email}</p>
                  <p>Status: {result.ticket.status}</p>
                  <button className="button green submit-button" type="button" disabled={result.ticket.status !== 'valid'} onClick={confirm}>Confirm Check-in</button>
                </div>
              )}
              {stats?.recent?.length ? (
                <div className="result-box">
                  <p className="kicker">Recent Check-ins</p>
                  <div className="payment-details">
                    {stats.recent.map((item) => (
                      <p key={`${item.ticketCode}-${item.checkedInAt}`}>
                        <span>{item.attendeeName}</span>
                        <strong>{item.ticketCode} - {new Date(item.checkedInAt).toLocaleTimeString()}</strong>
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </form>
          </div>
        </section>
      </OrganizerGate>
    </main>
  );
}
