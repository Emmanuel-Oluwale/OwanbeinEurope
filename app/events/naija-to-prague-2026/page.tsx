import { TicketGrid } from '@/app/components/TicketGrid';
import { eventDetails } from '@/lib/eventData';

const faqs = [
  ['What kind of event is this?', 'A public registration page for a community-driven Nigerian celebration in Prague, organized by friends and community members with clean records for payments, approvals, and tickets.'],
  ['What does the contribution cover?', 'Venue, catering, music, production, photography, and the shared costs needed to create the experience.'],
  ['Can I get a refund if my plans change?', 'No. Contributions are final because funds are committed to event costs as the celebration is prepared.'],
  ['What should I wear?', 'African Royalty: traditional African clothing, geles, agbadas, lace, vibrant colors, and premium cultural fashion.']
];

export default function EventPage() {
  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe in Europe</a>
          <div className="nav-links">
            <a href="/#tickets">Tickets</a>
            <a href="/my-ticket">Find My Ticket</a>
            <a href={eventDetails.instagramUrl}>Instagram</a>
          </div>
          <a className="button primary compact" href="/checkout">Get Access</a>
        </nav>
      </header>

      <section className="hero event-hero">
        <div className="container grid two hero-grid">
          <div>
            <p className="badge">{eventDetails.shortTitle}</p>
            <h1 className="title">Owanbe in Europe</h1>
            <p className="subtitle">Get ready to vibe with Naija beats and flavors as we bring the ultimate Owanbe party to Prague: music, dancing, great food, fashion, culture, and pure celebration energy.</p>
            <div className="actions">
              <a className="button primary" href="/checkout">Contribute & Reserve</a>
              <a className="button secondary" href={eventDetails.instagramUrl}>Instagram</a>
            </div>
          </div>
          <aside className="card event-panel">
            <p className="kicker">Gathering Details</p>
            <h2>{eventDetails.dateLabel}</h2>
            <p className="muted">{eventDetails.redCarpetLabel}</p>
            <p className="muted">{eventDetails.mainTimeLabel}</p>
            <p className="muted">{eventDetails.venueName}</p>
            <p className="muted">{eventDetails.venueAddress}</p>
            <p className="muted"><strong>Dress Code:</strong> {eventDetails.dressCode}</p>
          </aside>
        </div>
      </section>

      <section className="section pattern-section">
        <div className="container grid two">
          <div>
            <p className="kicker">The mood</p>
            <h2 className="section-title">Premium, cultural, festive, and proudly Nigerian.</h2>
          </div>
          <p className="muted">This gathering brings friends, community members, and culture lovers together for an unforgettable Prague celebration. The platform keeps the records professional while the event keeps the energy warm, stylish, and deeply Owanbe.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Contribution Tiers</p>
              <h2 className="section-title">One order, one ticket per attendee.</h2>
            </div>
            <a className="button green" href="/checkout">Reserve Now</a>
          </div>
          <TicketGrid />
        </div>
      </section>

      <section className="section ivory-band">
        <div className="container grid two">
          <div className="mini-flyer">
            <span>Official flyer slot</span>
            <strong>Naija to Prague</strong>
            <small>Use public/hero-flyer.jpeg when ready</small>
          </div>
          <div>
            <p className="kicker">Policy</p>
            <h2 className="section-title">Clear records, clear expectations.</h2>
            <p className="muted dark">Each reservation creates a pending order. Payment is confirmed manually by finance, then one ticket is issued per attendee. Payments are final and non-refundable because funds support venue, catering, music, and production commitments.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="kicker">FAQ</p>
          <div className="grid two">
            {faqs.map(([q, a]) => (
              <article className="card" key={q}>
                <h3>{q}</h3>
                <p className="muted">{a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <span>Owanbe in Europe</span>
          <a href={`mailto:${eventDetails.email}`}>{eventDetails.email}</a>
          <a href={eventDetails.instagramUrl}>Instagram</a>
        </div>
      </footer>
    </main>
  );
}
