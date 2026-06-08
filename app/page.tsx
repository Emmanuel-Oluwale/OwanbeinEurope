import { TicketGrid } from '@/app/components/TicketGrid';
import { eventDetails } from '@/lib/eventData';

const experiences = [
  ['Naija Beats', 'Afrobeats, amapiano, classics, and party anthems built for a real dance floor.'],
  ['Food & Flavors', 'A celebration shaped around familiar tastes, shared tables, and generous energy.'],
  ['African Royalty', 'Geles, agbadas, lace, aso-ebi energy, bold colors, and premium cultural fashion.'],
  ['Community Vibes', 'Friends, new connections, photos, laughter, and the feeling of home in Europe.']
];

const faqs = [
  ['How do I reserve?', 'Choose a ticket tier, enter buyer and attendee details, then pay by Czech bank transfer using your unique reference.'],
  ['When do I get tickets?', 'Finance confirms payment manually. Once approved, each attendee receives a unique ticket code and QR-ready record.'],
  ['Are payments refundable?', 'Contributions are final because funds are used to secure venue, catering, music, and production.']
];

export default function HomePage() {
  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe in Europe</a>
          <div className="nav-links">
            <a href="#event">Event</a>
            <a href="#tickets">Tickets</a>
            <a href="#faq">FAQ</a>
            <a href={eventDetails.instagramUrl}>Instagram</a>
            <a href="/my-ticket">Find My Ticket</a>
          </div>
          <a className="button primary compact" href="/checkout">Get Access</a>
        </nav>
      </header>

      <section className="hero home-hero">
        <div className="container grid two hero-grid">
          <div>
            <p className="badge">Premium Nigerian celebration in Prague</p>
            <h1 className="title">Naija to Prague</h1>
            <p className="subtitle">African Royalty. Naija beats. Prague energy. A community-driven Owanbe experience with music, food, fashion, culture, and people who came ready.</p>
            <div className="actions">
              <a className="button primary" href="/checkout">Reserve Your Spot</a>
              <a className="button secondary" href="/events/naija-to-prague-2026">View Event Details</a>
            </div>
            <div className="countdown" aria-label="Event countdown">
              <div><strong>2026</strong><span>Year</span></div>
              <div><strong>Aug 15</strong><span>Date</span></div>
              <div><strong>2 PM</strong><span>Red carpet</span></div>
              <div><strong>3-8 PM</strong><span>Main event</span></div>
            </div>
          </div>
          <div className="flyer-card" aria-label="Owanbe in Europe flyer placeholder">
            <div className="flyer-content">
              <p className="flyer-sub">Owanbe in Europe presents</p>
              <div>
                <div className="flyer-people" />
                <h2 className="flyer-title">Naija to Prague</h2>
              </div>
              <div>
                <p className="flyer-sub">{eventDetails.dateLabel}</p>
                <p>{eventDetails.venueName}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-strip" id="event">
        <div className="container stat-strip">
          <div className="stat"><strong>Aug 15</strong><span>Saturday, 2026</span></div>
          <div className="stat"><strong>Prague</strong><span>Czech Republic</span></div>
          <div className="stat"><strong>Royalty</strong><span>African dress code</span></div>
          <div className="stat"><strong>3-8 PM</strong><span>Main celebration</span></div>
        </div>
      </section>

      <section className="section pattern-section">
        <div className="container">
          <p className="kicker">The Experience</p>
          <h2 className="section-title">A proper Owanbe mood, brought into the heart of Europe.</h2>
          <div className="grid four">
            {experiences.map(([title, copy]) => (
              <article className="card accent-card" key={title}>
                <h3>{title}</h3>
                <p className="muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="tickets">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Tickets</p>
              <h2 className="section-title">Choose your access tier.</h2>
            </div>
            <a className="button green" href="/checkout">Start Checkout</a>
          </div>
          <TicketGrid />
        </div>
      </section>

      <section className="section ivory-band">
        <div className="container grid two">
          <div>
            <p className="kicker">Official Flyer</p>
            <h2 className="section-title">Ready for the real visual.</h2>
            <p className="muted dark">Place the official flyer at <strong>public/hero-flyer.jpeg</strong> or upload it later through Supabase event-media. Until then, the page keeps a premium flyer-inspired placeholder.</p>
          </div>
          <div className="mini-flyer">
            <span>OIE</span>
            <strong>Naija to Prague</strong>
            <small>African Royalty Edition</small>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <p className="kicker">FAQ & Policy</p>
          <div className="grid three">
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
          <a href={eventDetails.instagramUrl}>Instagram @owanbeineurope</a>
          <a href={`mailto:${eventDetails.email}`}>{eventDetails.email}</a>
        </div>
      </footer>
    </main>
  );
}
