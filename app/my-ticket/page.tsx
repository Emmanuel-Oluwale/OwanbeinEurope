'use client';

import { useState } from 'react';

type LookupResult = {
  error?: string;
  orderNumber?: string;
  amountCzk?: number;
  paymentStatus?: string;
  variableSymbol?: string;
  paymentAccountLabel?: string;
  tickets?: Array<{
    attendee_name: string;
    attendee_email: string;
    ticket_code: string;
    qr_code: string;
    status: string;
  }>;
};

export default function MyTicketPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const response = await fetch('/api/orders/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, email })
    });
    setResult(await response.json());
    setLoading(false);
  }

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe in Europe</a>
          <a className="button secondary compact" href="/checkout">Checkout</a>
        </nav>
      </header>
      <section className="section">
        <div className="container grid two">
          <div>
            <p className="kicker">Find My Ticket</p>
            <h1 className="section-title">Look up your reservation.</h1>
            <p className="muted">Use the order number and buyer email from checkout. Pending orders show payment status; paid orders show issued tickets.</p>
          </div>
          <form className="checkout-form" onSubmit={lookup}>
            <label className="field-label">Order number</label>
            <input className="field" required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="OIE-2026-000001" />
            <label className="field-label">Buyer email</label>
            <input className="field" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <button className="button primary submit-button" type="submit" disabled={loading}>{loading ? 'Looking up...' : 'Find Order'}</button>
            {result && (
              <div className={`result-box ${result.error ? 'error' : ''}`}>
                {result.error ? <p>{result.error}</p> : (
                  <>
                    <p className="kicker">{result.orderNumber}</p>
                    <h3>Status: {result.paymentStatus}</h3>
                    <p>Amount: {result.amountCzk?.toLocaleString('cs-CZ')} CZK</p>
                    {result.paymentStatus === 'pending' && <p>Payment is awaiting finance confirmation. Use variable symbol {result.variableSymbol} if you still need to complete transfer.</p>}
                    {result.paymentStatus === 'paid' && result.tickets?.map((ticket) => (
                      <div className="attendee-box" key={ticket.ticket_code}>
                        <h3>{ticket.attendee_name}</h3>
                        <p>{ticket.attendee_email}</p>
                        <p><strong>{ticket.ticket_code}</strong></p>
                        <p>Status: {ticket.status}</p>
                      </div>
                    ))}
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
