const tickets = [
  { name: 'Early Bird', price: '1,000 CZK' },
  { name: 'Regular', price: '1,200 CZK' },
  { name: 'Late Registration', price: '1,500 CZK' },
  { name: 'VIP', price: '2,500 CZK' }
];

const faqs = [
  {
    q: 'What kind of event is this?',
    a: 'This is a strictly non-commercial, private gathering of friends and community members. We are coming together to celebrate our shared culture and enjoy a genuine Naija-style Owanbe in Prague.'
  },
  {
    q: 'What does the contribution cover?',
    a: 'Your payment is a financial contribution as an attendee. Contributions go toward covering the communal costs of the venue, food, music, and production.'
  },
  {
    q: 'Can I get a refund if my plans change?',
    a: 'No. Contributions are final because funds are pooled and used to secure the venue, catering, and event setup.'
  },
  {
    q: 'What is the dress code?',
    a: 'African Royalty. Step out in your finest traditional African clothing, vibrant colors, geles, agbadas, and majestic styles fitting for a true Owanbe.'
  }
];

export default function EventPage() {
  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">OWANBE IN EUROPE</a>
          <a className="button primary" href="/checkout?event=naija-to-prague-2026">Get Access</a>
        </nav>
      </header>

      <section className="hero">
        <div className="container grid two" style={{ alignItems: 'center' }}>
          <div>
            <p className="badge">Naija to Prague</p>
            <h1 className="title">Owanbe in Europe</h1>
            <p className="subtitle">Get ready to vibe with Naija beats and flavors as we bring the ultimate Owanbe party to Prague.</p>
            <div className="actions">
              <a className="button primary" href="/checkout?event=naija-to-prague-2026">Contribute & Reserve</a>
              <a className="button secondary" href="https://www.instagram.com/owanbeineurope">Instagram</a>
            </div>
          </div>
          <div className="card">
            <p className="kicker">Gathering Details</p>
            <h2>Saturday, August 15, 2026</h2>
            <p className="muted">Red Carpet & Photography: 2:00 PM</p>
            <p className="muted">Main Celebration: 3:00 PM - 8:00 PM CEST</p>
            <p className="muted">Highlight Event Centre Hlubocepy, Prague, Czech Republic</p>
            <p className="muted"><strong>Dress Code:</strong> African Royalty</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid two">
          <div>
            <p className="kicker">Private Community Gathering</p>
            <h2>Good vibes, great people, and true Owanbe energy.</h2>
          </div>
          <p className="muted">This is not a commercial event. It is a private, community gathering of friends coming together for an unforgettable celebration. Expect non-stop music, energetic dancing, Naija flavors, and pure fun as we blend cultures and create amazing memories in Prague.</p>
        </div>
      </section>

      <section className="section" style={{ background: '#0d0a06' }}>
        <div className="container">
          <p className="kicker">Contribution Tiers</p>
          <h2>Choose your access</h2>
          <div className="grid four" style={{ marginTop: 24 }}>
            {tickets.map((ticket) => (
              <div className="card" key={ticket.name}>
                <h3>{ticket.name}</h3>
                <div className="price">{ticket.price}</div>
                <p className="muted">Community contribution toward venue, food, music, and production.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="kicker">FAQ</p>
          <div className="grid two" style={{ marginTop: 24 }}>
            {faqs.map((item) => (
              <div className="card" key={item.q}>
                <h3>{item.q}</h3>
                <p className="muted">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#0d0a06' }}>
        <div className="container grid two">
          <div className="card">
            <p className="kicker">Contribution Policy</p>
            <p className="muted">All funds collected are personal contributions from attendees to make this gathering happen collectively. Because these funds are used to book the venue, catering, and production, contributions are strictly non-refundable.</p>
          </div>
          <div className="card">
            <p className="kicker">Connect With Us</p>
            <p className="muted">Instagram: @owanbeineurope</p>
            <p className="muted">Email: info@owanbeineurope.cz</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">Owanbe in Europe - Premium Nigerian community experiences across Europe.</div>
      </footer>
    </main>
  );
}
