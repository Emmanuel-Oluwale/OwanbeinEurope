'use client';

import { useState } from 'react';

const ticketOptions = [
  { id: 'early-bird', name: 'Early Bird', price: 1000 },
  { id: 'regular', name: 'Regular', price: 1200 },
  { id: 'late-registration', name: 'Late Registration', price: 1500 },
  { id: 'vip', name: 'VIP', price: 2500 }
];

export default function CheckoutPage() {
  const [ticketType, setTicketType] = useState('early-bird');
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const selected = ticketOptions.find((item) => item.id === ticketType) || ticketOptions[0];
  const total = selected.price * quantity;

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventSlug: 'naija-to-prague-2026',
        ticketType,
        quantity,
        fullName,
        email,
        phone
      })
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">OWANBE IN EUROPE</a>
          <a className="button secondary" href="/events/naija-to-prague-2026">Back to Event</a>
        </nav>
      </header>

      <section className="section">
        <div className="container grid two">
          <div>
            <p className="kicker">Checkout</p>
            <h1 className="title" style={{ fontSize: 'clamp(42px, 6vw, 72px)' }}>Reserve your spot</h1>
            <p className="muted">Choose your contribution tier, enter your details, and receive secure bank transfer instructions with a unique order reference.</p>
          </div>

          <form className="card" onSubmit={submitOrder}>
            <label className="muted">Ticket tier</label>
            <select value={ticketType} onChange={(event) => setTicketType(event.target.value)} style={fieldStyle}>
              {ticketOptions.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>{ticket.name} - {ticket.price} CZK</option>
              ))}
            </select>

            <label className="muted">Quantity</label>
            <input style={fieldStyle} type="number" min="1" max="10" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />

            <label className="muted">Full name</label>
            <input style={fieldStyle} required value={fullName} onChange={(event) => setFullName(event.target.value)} />

            <label className="muted">Email</label>
            <input style={fieldStyle} required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />

            <label className="muted">Phone</label>
            <input style={fieldStyle} value={phone} onChange={(event) => setPhone(event.target.value)} />

            <div className="card" style={{ margin: '18px 0', background: 'rgba(212,175,55,.08)' }}>
              <p className="kicker">Total contribution</p>
              <div className="price">{total.toLocaleString('cs-CZ')} CZK</div>
            </div>

            <button className="button primary" type="submit" disabled={loading} style={{ border: 0, width: '100%', cursor: 'pointer' }}>
              {loading ? 'Creating order...' : 'Create Order'}
            </button>

            {result && (
              <div className="card" style={{ marginTop: 20 }}>
                {result.error ? (
                  <p className="muted">{result.error}</p>
                ) : (
                  <>
                    <p className="kicker">Order Created</p>
                    <h3>{result.orderNumber}</h3>
                    <p className="muted">Amount: {result.amountCzk?.toLocaleString('cs-CZ')} CZK</p>
                    <p className="muted">Variable symbol: {result.variableSymbol}</p>
                    <p className="muted">Assigned account: {result.accountName}</p>
                    <p className="muted">IBAN: {result.iban}</p>
                    <p className="muted">After payment is confirmed by finance, your QR ticket will be issued.</p>
                  </>
                )}
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  margin: '8px 0 16px',
  padding: '14px 16px',
  borderRadius: 14,
  border: '1px solid rgba(212,175,55,.35)',
  background: '#0d0a06',
  color: '#fff'
};
