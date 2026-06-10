'use client';

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
  }
];

export default function OrganizerPage() {
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

      <OrganizerGate area="organizer">
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
          </div>
        </section>
      </OrganizerGate>
    </main>
  );
}
