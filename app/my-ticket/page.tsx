'use client';

import { useEffect, useState } from 'react';

const instagramUrl = 'https://www.instagram.com/owanbeineurope';

type LookupResult = {
  error?: string;
  orderNumber?: string;
  amountCzk?: number;
  paymentStatus?: string;
  variableSymbol?: string;
  paymentAccountLabel?: string;
  paymentQrUrl?: string | null;
  accountName?: string;
  iban?: string;
  bic?: string;
  tickets?: Array<{
    attendee_name: string;
    attendee_email: string;
    ticket_code: string;
    qr_code: string;
    qr_image_url?: string | null;
    status: string;
  }>;
};

export default function MyTicketPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get('order');
    const ticket = params.get('ticket');

    if (ticket) {
      lookupPayload({ ticketCode: ticket });
      return;
    }

    if (order) {
      setOrderNumber(order);
      lookupPayload({ orderNumber: order });
    }
  }, []);

  async function lookupPayload(payload: { orderNumber?: string; email?: string; ticketCode?: string }) {
    setLoading(true);
    setResult(null);

    const response = await fetch('/api/orders/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setResult(await response.json());
    setLoading(false);
  }

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await lookupPayload({ orderNumber, email });
  }

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe in Europe</a>
          <div className="nav-links">
            <a href="/">Home</a>
            <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </nav>
      </header>
      <section className="section">
        <div className="container grid two">
          <div>
            <p className="kicker">Find My Ticket</p>
            <h1 className="section-title">Look up your reservation.</h1>
            <p className="muted">Use the order number and buyer email from checkout. Direct order and ticket links from email load automatically.</p>
          </div>
          <form className="checkout-form" onSubmit={lookup}>
            <label className="field-label">Order number</label>
            <input className="field" required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="OIE-2026-000001" />
            <label className="field-label">Buyer email</label>
            <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <button className="button primary submit-button" type="submit" disabled={loading}>{loading ? 'Looking up...' : 'Find Order'}</button>
            {result && (
              <div className={`result-box ${result.error ? 'error' : ''}`}>
                {result.error ? <p>{result.error}</p> : (
                  <>
                    <p className="kicker">{result.orderNumber}</p>
                    <h3>Status: {result.paymentStatus}</h3>
                    <p>Amount: {result.amountCzk?.toLocaleString('cs-CZ')} CZK</p>

                    {result.paymentStatus === 'pending' && (
                      <div className="attendee-box">
                        <h3>Payment Pending</h3>
                        <p>We are still waiting for finance to confirm your payment. If you have not paid yet, use the payment details below.</p>
                        {result.paymentQrUrl && <img className="ticket-qr" src={result.paymentQrUrl} alt="Bank transfer QR payment code" />}
                        <div className="payment-details">
                          <p><span>Recipient</span><strong>{result.accountName || result.paymentAccountLabel || 'Assigned account'}</strong></p>
                          <p><span>IBAN</span><strong>{result.iban || 'Check your payment email'}</strong></p>
                          <p><span>BIC</span><strong>{result.bic || 'Check your payment email'}</strong></p>
                          <p><span>Variable Symbol</span><strong>{result.variableSymbol}</strong></p>
                          <p><span>Order Reference</span><strong>{result.orderNumber}</strong></p>
                          <p><span>Amount</span><strong>{result.amountCzk?.toLocaleString('cs-CZ')} CZK</strong></p>
                        </div>
                        <div className="notice">
                          <p><strong>How to pay with QR:</strong> Open your banking app, choose its QR payment scanner, then scan the QR code above.</p>
                          <p>Do not scan this QR code with your normal phone camera. Use your bank app's payment scanner.</p>
                          <p>If your bank does not support QR payments, use the IBAN, BIC, amount, variable symbol, and order reference shown above.</p>
                        </div>
                      </div>
                    )}

                    {result.paymentStatus === 'paid' && result.tickets?.map((ticket) => (
                      <div className="attendee-box" key={ticket.ticket_code}>
                        <h3>{ticket.attendee_name}</h3>
                        <p>{ticket.attendee_email}</p>
                        {(ticket.qr_image_url || ticket.qr_code) && <img className="ticket-qr" src={ticket.qr_image_url || ticket.qr_code} alt={`QR code for ${ticket.attendee_name}`} />}
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
