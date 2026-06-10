'use client';

import { useState } from 'react';
import { OrganizerGate } from '@/app/components/OrganizerGate';

const links = [
  {
    title: 'Finance Dashboard',
    href: '/finance',
    description: 'Review assigned pending payments, confirm bank transfers, and issue tickets.'
  },
  {
    title: 'Check-in Scanner',
    href: '/checkin',
    description: 'Validate ticket QR codes and mark guests as checked in at the entrance.'
  },
  {
    title: 'Find My Ticket',
    href: '/my-ticket',
    description: 'Help guests recover pending payment details or retrieve issued ticket QR codes.'
  },
  {
    title: 'Public Event Page',
    href: '/events/naija-to-prague-2026',
    description: 'Open the live event page exactly as guests see it.'
  },
  {
    title: 'Media Manager',
    href: '/admin/media',
    description: 'Upload event videos, flyers, sponsor logos, and gallery images to Supabase Storage.'
  },
  {
    title: 'Event Settings',
    href: '/admin/settings',
    description: 'Update live ticket prices, quantities, sale windows, and ticket visibility.'
  }
];

const exports = [
  {
    title: 'Attendees CSV',
    href: '/api/admin/exports/attendees',
    description: 'Full guest list with attendee contact details, ticket codes, and payment status. Admin only.'
  },
  {
    title: 'Finance CSV',
    href: '/api/admin/exports/finance',
    description: 'Order revenue, payment status, handlers, variable symbols, and approval details.'
  },
  {
    title: 'Check-in CSV',
    href: '/api/admin/exports/checkins',
    description: 'Checked-in guests, ticket codes, timestamps, and organizer audit details. Admin only.'
  }
];

export default function OrganizerPage() {
  const [resendOrderNumber, setResendOrderNumber] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendingType, setResendingType] = useState<'payment' | 'tickets' | null>(null);

  async function resendEmail(type: 'payment' | 'tickets') {
    const orderNumber = resendOrderNumber.trim();
    if (!orderNumber) {
      setResendMessage('Enter an order number first.');
      return;
    }

    setResendingType(type);
    setResendMessage(type === 'payment' ? 'Resending payment instructions...' : 'Resending ticket email...');

    const response = await fetch(`/api/admin/resend/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber })
    });
    const data = await response.json();
    setResendMessage(data.error || data.message || 'Email resent.');
    setResendingType(null);
  }

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe Organizer</a>
          <div className="nav-links">
            <a href="/finance">Finance</a>
            <a href="/checkin">Check-in</a>
          </div>
        </nav>
      </header>

      <OrganizerGate area="finance">
        <section className="section">
          <div className="container">
            <p className="kicker">Organizer Hub</p>
            <h1 className="section-title">Manage the event from one place.</h1>
            <p className="muted">Use this page as the internal starting point for finance confirmation, guest support, check-in, and live event checks.</p>

            <div className="grid four">
              <article className="card">
                <p className="kicker">Finance</p>
                <h3>Restricted by handler</h3>
                <p className="muted">Finance users only see their assigned account orders. Admins can see all.</p>
              </article>
              <article className="card">
                <p className="kicker">Tickets</p>
                <h3>QR enabled</h3>
                <p className="muted">Payment and ticket QR codes are available in email and ticket lookup.</p>
              </article>
              <article className="card">
                <p className="kicker">Check-in</p>
                <h3>Code validation</h3>
                <p className="muted">Door team can scan or search ticket codes to validate guests.</p>
              </article>
              <article className="card">
                <p className="kicker">Support</p>
                <h3>Guest recovery</h3>
                <p className="muted">Use ticket lookup to help guests find payment instructions or tickets.</p>
              </article>
            </div>

            <div className="grid two">
              {links.map((link) => (
                <article className="card" key={link.href}>
                  <p className="kicker">Organizer Tool</p>
                  <h3>{link.title}</h3>
                  <p className="muted">{link.description}</p>
                  <a className="button secondary submit-button" href={link.href}>Open {link.title}</a>
                </article>
              ))}
            </div>

            <div className="summary-panel">
              <p className="kicker">CSV Exports</p>
              <h2>Download event data.</h2>
              <p className="muted">Exports use your organizer permissions. Finance users only receive finance data they are allowed to see.</p>
              <div className="actions compact-actions">
                {exports.map((item) => (
                  <a className="button secondary" href={item.href} key={item.href}>{item.title}</a>
                ))}
              </div>
            </div>

            <div className="summary-panel">
              <p className="kicker">Email Support</p>
              <h2>Resend customer emails.</h2>
              <p className="muted">Use an order number to resend payment instructions or ticket-ready emails. Ticket emails only work after payment approval.</p>
              <label className="field-label">Order number</label>
              <input
                className="field"
                placeholder="OIE-2026-000001"
                value={resendOrderNumber}
                onChange={(event) => setResendOrderNumber(event.target.value)}
              />
              <div className="actions compact-actions">
                <button className="button secondary" type="button" onClick={() => resendEmail('payment')} disabled={Boolean(resendingType)}>
                  {resendingType === 'payment' ? 'Sending...' : 'Resend Payment Email'}
                </button>
                <button className="button green" type="button" onClick={() => resendEmail('tickets')} disabled={Boolean(resendingType)}>
                  {resendingType === 'tickets' ? 'Sending...' : 'Resend Ticket Email'}
                </button>
              </div>
              {resendMessage && <div className={`result-box ${resendMessage.toLowerCase().includes('not') || resendMessage.toLowerCase().includes('cannot') || resendMessage.toLowerCase().includes('error') ? 'error' : ''}`}>{resendMessage}</div>}
            </div>
          </div>
        </section>
      </OrganizerGate>
    </main>
  );
}
