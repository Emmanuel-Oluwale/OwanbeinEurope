import './home-design.css';
import { HomeClient } from './HomeClient';
import { eventDetails, ticketOptions } from '@/lib/eventData';

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M5 12l5 5 9-11" />
  </svg>
);

const ticketMeta: Record<string, { features: string[]; style: 'primary' | 'ghost'; label: string; vip?: boolean }> = {
  'early-bird': {
    features: ['Founding community access', 'Limited availability'],
    style: 'ghost',
    label: 'Get Early Access'
  },
  regular: {
    features: ['Full event access', 'Standard entry'],
    style: 'primary',
    label: 'Reserve Ticket'
  },
  'late-registration': {
    features: ['Final release batch', 'Full event access'],
    style: 'ghost',
    label: 'Last Chance Access'
  },
  vip: {
    features: ['Premium entry', 'Priority experience', 'Elevated seating feel'],
    style: 'primary',
    label: 'Upgrade Experience',
    vip: true
  }
};

export default function HomePage() {
  return (
    <div className="ow-page">

      {/* ===== NAV ===== */}
      <nav className="nav" id="ow-nav">
        <a className="brand" href="#top">
          <span className="crest">O</span>
          <span className="bt">
            <b>Owanbe</b>
            <span>in Europe</span>
          </span>
        </a>
        <div className="nav-links">
          <a href="#homecoming">The Homecoming</a>
          <a href="#experience">Experience</a>
          <a href="#details">Event</a>
          <a href="#tickets">Access</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-cta">
          <a href="/checkout" className="btn btn-primary">Reserve Your Spot</a>
          <button className="nav-toggle" id="navToggle" aria-label="Open menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className="mobile-menu" id="mobileMenu">
        <a href="#homecoming">The Homecoming</a>
        <a href="#experience">Experience</a>
        <a href="#details">Event</a>
        <a href="#tickets">Access</a>
        <a href="#faq">FAQ</a>
        <a href="/checkout" className="btn btn-primary">Reserve Your Spot</a>
      </div>

      {/* ===== HERO ===== */}
      <header className="hero grain" id="top">
        <div className="hero-bg" id="heroBg">
          <video className="hero-video" autoPlay muted loop playsInline>
            <source src="https://qowshteywtbilyybqkwm.supabase.co/storage/v1/object/public/event-media/Hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-tint" />
        <div className="hero-scrim" />
        <div className="hero-inner" style={{ paddingLeft: '74px', paddingRight: '74px' }}>
          <div className="reveal in">
            <span className="hero-sub">NAIJA TO PRAGUE</span>
            <h1 className="h-display">Europe&rsquo;s home of Owanbe Culture</h1>
            <p className="hero-tagline">
              A community Owanbe experience in the heart of Prague — music, fashion, food and family, the way home feels.
            </p>
          </div>
          <div className="hero-meta reveal in" data-d="1">
            <span className="mi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" />
              </svg>
              {eventDetails.city}, {eventDetails.country}
            </span>
            <span className="mi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" />
              </svg>
              {eventDetails.dateLabel}
            </span>
            <span className="mi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" />
              </svg>
              3:00 PM – 8:00 PM
            </span>
          </div>
          <div className="hero-actions reveal in" data-d="2">
            <a href="/checkout" className="btn btn-primary btn-lg">
              Reserve Your Spot
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
            <a href="#experience" className="btn btn-ghost btn-lg">View Experience</a>
          </div>
        </div>
        <div className="scroll-hint">
          <span>Scroll</span>
          <span className="line" />
        </div>
      </header>

      {/* ===== HOMECOMING ===== */}
      <section className="section bg-ivory" id="homecoming">
        <div className="wrap split">
          <div className="col-text">
            <span className="eyebrow reveal">WHAT IS OWANBE IN EUROPE</span>
            <h2 className="h-section reveal" data-d="1">
              More than a party.<br />A <span className="serif-em">homecoming</span>.
            </h2>
            <p className="lead reveal" data-d="2" style={{ textAlign: 'justify' }}>
              Owanbe in Europe is a cultural experience built for Africans in the diaspora, and anyone who wants to feel the energy of a Nigerian celebration. Music, fashion, food and community, gathered into one room for one unforgettable evening.
            </p>
            <blockquote className="pull-quote reveal" data-d="3">
              If you&rsquo;ve missed home, this is where you find it again.
            </blockquote>
          </div>
          <div className="col-media reveal" data-d="2">
            <div className="media-stack">
              <div className="ph front" data-tone="sand">
                <img src="/images/asoebi-guests.jpeg" alt="Aso-ebi guests in coordinated navy and green attire" />
              </div>
              <div className="ph back">
                <img src="/images/gele-closeup.jpeg" alt="Gold gele head-tie close-up" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== EXPERIENCE PILLARS ===== */}
      <section className="section bg-sand grain" id="experience">
        <div className="wrap">
          <div style={{ maxWidth: '620px' }}>
            <span className="eyebrow reveal">The Experience</span>
            <h2 className="h-section reveal" data-d="1" style={{ marginTop: '20px' }}>
              Four things you&rsquo;ll feel the moment you walk in.
            </h2>
          </div>
          <div className="pillars">
            <article className="pillar reveal" data-d="1">
              <span className="num">01</span>
              <span className="pic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" />
                </svg>
              </span>
              <h3>Music &amp; Energy</h3>
              <p>Afrobeats, amapiano, highlife and the classics, a floor that never sits down.</p>
            </article>
            <article className="pillar reveal" data-d="2">
              <span className="num">02</span>
              <span className="pic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 3v7a3 3 0 0 0 6 0V3M7 10v11M14 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4 2.5-1 2.5-4-1-5-2.5-5ZM16.5 12v9" />
                </svg>
              </span>
              <h3>Food &amp; Culture</h3>
              <p>Shared tables, Nigerian flavours and the familiar taste of home, plated with care.</p>
            </article>
            <article className="pillar reveal" data-d="3">
              <span className="num">03</span>
              <span className="pic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8Z" />
                </svg>
              </span>
              <h3>Fashion &amp; Royalty</h3>
              <p>Aso-ebi, gele, agbada, lace, where elegance and identity arrive together.</p>
            </article>
            <article className="pillar reveal" data-d="4">
              <span className="num">04</span>
              <span className="pic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" />
                  <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M15 19c0-2 1-3.4 2.6-3.8" />
                </svg>
              </span>
              <h3>Community</h3>
              <p>People, laughter, photos and connections that feel like they&rsquo;ve always been there.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== GALLERY ===== */}
      <section className="section bg-green grain">
        <div className="wrap">
          <div className="gallery-head">
            <div>
              <span className="eyebrow reveal">Visual Culture</span>
              <h2 className="h-section reveal" data-d="1" style={{ marginTop: '18px' }}>The Owanbe Mood</h2>
            </div>
            <p className="lead reveal" data-d="2" style={{ color: 'color-mix(in oklab, var(--ivory) 72%, transparent)', marginBottom: '8px' }}>
              This is what Prague will feel like on August&nbsp;15.
            </p>
          </div>
          <div className="gallery">
            <div className="ph g-tall reveal" data-tone="gold">
              <img src="/images/gallery/gele-detail.jpeg" alt="Green gele and head-tie detail" />
            </div>
            <div className="ph reveal" data-d="1">
              <img src="/images/gallery/money-spray.jpeg" alt="Money spray on the celebrant" />
            </div>
            <div className="ph g-wide reveal" data-d="2" data-tone="sand">
              <img src="/images/gallery/crowd-energy.jpeg" alt="Crowd energy on the dance floor" />
            </div>
            <div className="ph reveal" data-d="1" data-tone="char">
              <img src="/images/gallery/small-chops.jpeg" alt="Small chops platter" />
            </div>
            <div className="ph reveal" data-d="2">
              <img src="/images/gallery/dancing-aunties.jpeg" alt="Dancing aunties in aso-ebi" />
            </div>
            <div className="ph g-tall reveal" data-d="3" data-tone="sand">
              <img src="/images/gallery/asoebi-full.jpeg" alt="Full-length aso-ebi agbada" />
            </div>
            <div className="ph reveal" data-d="1" data-tone="gold">
              <img src="/images/gallery/jollof.jpeg" alt="Nigerian jollof rice" />
            </div>
            <div className="ph g-wide reveal" data-d="2">
              <img src="/images/gallery/drummers.jpeg" alt="Live band and drummers on stage" style={{ objectFit: 'cover' }} />
            </div>
            <div className="ph reveal" data-d="3" data-tone="char">
              <img src="/images/gallery/hands-fabric.jpeg" alt="Hands and lace fabric detail" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== EVENT DETAILS ===== */}
      <section className="section bg-ivory" id="details">
        <div className="wrap event-spread">
          <div className="event-poster reveal">
            <div className="ph" data-tone="gold">
              <img src="/images/event-portrait.jpeg" alt="Couple in coordinated aso-ebi attire" />
            </div>
          </div>
          <div className="event-copy">
            <span className="eyebrow reveal">The Event</span>
            <h2 className="event-title reveal" data-d="1" style={{ marginTop: '16px' }}>
              Naija to<br />Prague <span className="yr">2026</span>
            </h2>
            <p className="lead reveal" data-d="2" style={{ marginTop: '24px' }}>
              A curated Owanbe experience bringing together diaspora culture, music, food and celebration in one unforgettable evening.
            </p>
            <div className="detail-list reveal" data-d="3">
              <div className="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" />
                </svg>
                <span className="k">Venue</span>
                <span className="v">{eventDetails.venueName}</span>
              </div>
              <div className="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" />
                </svg>
                <span className="k">Date</span>
                <span className="v">{eventDetails.dateLabel}</span>
              </div>
              <div className="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" />
                </svg>
                <span className="k">Time</span>
                <span className="v">{eventDetails.mainTimeLabel}</span>
              </div>
              <div className="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M5 16l-1.5-7 4.5 3L12 6l3.5 6 4.5-3L18.5 16H5Z" /><path d="M5 19h13.5" />
                </svg>
                <span className="k">Dress Code</span>
                <span className="v">{eventDetails.dressCode}</span>
              </div>
            </div>
            <a href="/checkout" className="btn btn-primary btn-lg reveal" data-d="3" style={{ marginTop: '34px' }}>
              Reserve Your Spot
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===== TICKETS ===== */}
      <section className="section bg-sand grain" id="tickets">
        <div className="wrap">
          <div className="tickets-head">
            <span className="eyebrow center reveal">Reserve</span>
            <h2 className="h-section reveal" data-d="1">Choose your access</h2>
            <p className="lead reveal" data-d="2" style={{ textAlign: 'center' }}>
              Every tier is one room, one night, one family. Choose the entrance that suits you.
            </p>
          </div>
          <div className="ticket-grid">
            {ticketOptions.map((ticket, i) => {
              const meta = ticketMeta[ticket.id] ?? { features: [], style: 'ghost' as const, label: 'Reserve', vip: false };
              return (
                <article key={ticket.id} className={`ticket reveal${meta.vip ? ' feature' : ''}`} data-d={String(i + 1)}>
                  {meta.vip && <span className="ribbon">VIP</span>}
                  <span className="tier">
                    <svg className="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      {meta.vip
                        ? <path d="M5 19l-1-9 4 3 4-6 4 6 4-3-1 9H5Z" />
                        : ticket.id === 'early-bird'
                          ? <path d="M12 3v18M5 8l7-5 7 5" />
                          : ticket.id === 'regular'
                            ? <><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></>
                            : <path d="M5 19l-1-9 4 3 4-6 4 6 4-3-1 9H5Z" />
                      }
                    </svg>
                    {ticket.name}
                  </span>
                  <div className="price">{ticket.price.toLocaleString('cs-CZ')} <small>CZK</small></div>
                  <ul className="feats">
                    {meta.features.map((f) => (
                      <li key={f}>{CHECK_ICON}{f}</li>
                    ))}
                  </ul>
                  <a href="/checkout" className={`btn btn-${meta.style}${meta.style === 'ghost' && !meta.vip ? ' on-light' : ''}`}>
                    {meta.label}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== OFFICIAL INVITATION ===== */}
      <section className="section invite grain">
        <div className="poster-bg">
          <div className="ph">
            <img src="/images/owanbe-flyer.jpeg" alt="" />
          </div>
        </div>
        <div className="scrim2" />
        <div className="wrap invite-inner invite-spread">
          <a
            className="flyer-card reveal"
            href="/images/owanbe-flyer.jpeg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the official flyer full size"
          >
            <img src="/images/owanbe-flyer.jpeg" alt="Owanbe in Europe official flyer — From Naija to Prague, Saturday 15th August 2026" />
            <span className="flyer-zoom">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
              </svg>
            </span>
          </a>
          <div className="invite-copy reveal" data-d="1">
            <span className="soon">The Official Invitation</span>
            <h2 className="h-section" style={{ color: 'var(--ivory)' }}>
              You&rsquo;re<br />invited.
            </h2>
            <p className="lead" style={{ color: 'color-mix(in oklab, var(--ivory) 80%, transparent)' }}>
              Fashion, dance, food and full media coverage — from Naija to Prague. Save the flyer, share it with your people, and come dressed as royalty.
            </p>
            <ul className="invite-meta">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" />
                </svg>
                {eventDetails.venueName} · {eventDetails.venueAddress}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" />
                </svg>
                {eventDetails.dateLabel}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                </svg>
                @owanbeineurope
              </li>
            </ul>
            <div className="invite-actions">
              <a href="/images/owanbe-flyer.jpeg" download="Owanbe-in-Europe-Flyer.jpeg" className="btn btn-primary btn-lg">
                Download Flyer
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
                </svg>
              </a>
              <a href="/checkout" className="btn btn-ghost btn-lg">Reserve Your Spot</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section bg-ivory" id="faq">
        <div className="wrap faq-wrap">
          <div>
            <span className="eyebrow reveal">Good to Know</span>
            <h2 className="h-section reveal" data-d="1" style={{ marginTop: '18px' }}>Questions, answered.</h2>
            <p className="lead reveal" data-d="2" style={{ marginTop: '22px' }}>
              Anything else? Reach us on Instagram — we reply to every message.
            </p>
          </div>
          <div className="faq-list reveal" data-d="1">
            {[
              ['How do I get my ticket?', 'Fill in your details at checkout and pay by Czech bank transfer using your unique reference number. Finance confirms payment manually — once approved, each attendee receives a unique ticket code and QR ready for entry on the night.'],
              ['Are tickets refundable?', 'No. Funds go directly toward production, venue and catering — the things that make the night feel like home. Please reserve only when you\'re sure.'],
              ['Can I come alone?', 'Absolutely. Many attendees come solo and connect on-site. Owanbe is built for it — you\'ll leave with new people in your corner.'],
              ['What should I wear?', 'The dress code is African Royalty. Aso-ebi, gele, agbada, lace, or your finest interpretation of elegance. Come dressed to be photographed.'],
              ['Who are the organizers?', 'We\'re a community of friends and like-minded individuals who came together to feel and give back a little bit of home, outside of home. Owanbe in Europe is built by the diaspora, for the diaspora.']
            ].map(([q, a]) => (
              <div className="faq-item" key={q}>
                <button className="faq-q">{q}<span className="ic" /></button>
                <div className="faq-a"><p>{a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="section bg-green-deep final grain">
        <div className="ph">
          <img src="/images/final-group.jpeg" alt="Family in coordinated blue aso-ebi" />
        </div>
        <div className="final-tint" />
        <div className="wrap final-inner">
          <span className="eyebrow center reveal">August 15 · Prague</span>
          <h2 className="reveal" data-d="1">Prague is waiting.<br /><em>Home is calling.</em></h2>
          <div className="final-actions reveal" data-d="2">
            <a href="/checkout" className="btn btn-primary btn-lg">
              Reserve Your Spot
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
            <a href={eventDetails.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
              Follow on Instagram
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <a className="brand" href="#top">
              <span className="crest">O</span>
              <span className="bt">
                <b>Owanbe</b>
                <span style={{ fontSize: '13px' }}>in Europe</span>
              </span>
            </a>
            <p className="footer-tag">
              African Royalty meets Owanbe Nightlife. A community Owanbe experience in the heart of Prague.
            </p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <a href="#homecoming">The Homecoming</a>
            <a href="#experience">The Experience</a>
            <a href="#details">Event Details</a>
            <a href="#tickets">Access &amp; Tickets</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <a href={eventDetails.instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram — @owanbeineurope
            </a>
            <a href={`mailto:${eventDetails.email}`}>{eventDetails.email}</a>
            <p>{eventDetails.venueName}<br />{eventDetails.city}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Owanbe in Europe. Naija to Prague.</span>
          <span>Made with love for the diaspora.</span>
        </div>
      </footer>

      <HomeClient />
    </div>
  );
}
