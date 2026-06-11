'use client';

import { useEffect, useState } from 'react';

type CustomerOrder = {
  createdAt: string;
  orderNumber: string;
  buyerName: string;
  amountCzk: number;
  paymentStatus: string;
  variableSymbol: string;
  paymentAccountLabel: string;
  paymentQrUrl?: string | null;
  accountName?: string | null;
  iban?: string | null;
  bic?: string | null;
  orderUrl: string;
  tickets: Array<{
    attendeeName: string;
    attendeeEmail: string;
    ticketCode: string;
    qrImageUrl?: string | null;
    status: string;
    ticketUrl: string;
  }>;
};

type OrdersResult = {
  error?: string;
  orders?: CustomerOrder[];
};

export default function MyOrdersPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrdersResult | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      loadOrders(emailParam);
    }
  }, []);

  async function loadOrders(nextEmail = email) {
    setLoading(true);
    setResult(null);
    const response = await fetch('/api/orders/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: nextEmail })
    });
    setResult(await response.json());
    setLoading(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadOrders();
  }

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe in Europe</a>
          <div className="nav-links">
            <a href="/checkout">Checkout</a>
            <a href="/my-ticket">Find Ticket</a>
          </div>
        </nav>
      </header>

      <section className="section checkout-section">
        <div className="container grid checkout-grid">
          <div>
            <p className="kicker">My Orders</p>
            <h1 className="section-title checkout-title">Your reservations in one place.</h1>
            <p className="muted">Enter the buyer email used at checkout to view pending payment details, issued tickets, QR codes, and direct ticket links.</p>
          </div>

          <form className="checkout-form" onSubmit={submit}>
            <label className="field-label">Buyer email</label>
            <input className="field" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            <button className="button primary submit-button" type="submit" disabled={loading}>{loading ? 'Loading orders...' : 'View My Orders'}</button>

            {result && (
              <div className={`result-box ${result.error ? 'error' : ''}`}>
                {result.error ? (
                  <p>{result.error}</p>
                ) : !result.orders?.length ? (
                  <p>No orders found for that email.</p>
                ) : (
                  <div className="order-list">
                    {result.orders.map((order) => (
                      <article className="attendee-box" key={order.orderNumber}>
                        <div className="split-row">
                          <div>
                            <p className="kicker">{order.orderNumber}</p>
                            <h3>{order.paymentStatus === 'paid' ? 'Tickets Ready' : 'Payment Pending'}</h3>
                          </div>
                          <strong>{order.amountCzk.toLocaleString('cs-CZ')} CZK</strong>
                        </div>

                        <div className="payment-details">
                          <p><span>Status</span><strong>{order.paymentStatus}</strong></p>
                          <p><span>Created</span><strong>{new Date(order.createdAt).toLocaleString()}</strong></p>
                          <p><span>Variable Symbol</span><strong>{order.variableSymbol}</strong></p>
                          <p><span>Handler</span><strong>{order.paymentAccountLabel}</strong></p>
                        </div>

                        {order.paymentStatus !== 'paid' && (
                          <>
                            {order.paymentQrUrl && <img className="ticket-qr" src={order.paymentQrUrl} alt="Bank transfer QR payment code" />}
                            <div className="payment-details">
                              <p><span>Recipient</span><strong>{order.accountName || 'Assigned account'}</strong></p>
                              <p><span>IBAN</span><strong>{order.iban || 'Check your email'}</strong></p>
                              <p><span>BIC</span><strong>{order.bic || 'Check your email'}</strong></p>
                            </div>
                          </>
                        )}

                        {order.tickets.length > 0 && (
                          <div className="attendee-list">
                            <p className="kicker">Tickets</p>
                            {order.tickets.map((ticket) => (
                              <div className="attendee-box" key={ticket.ticketCode}>
                                <h3>{ticket.attendeeName}</h3>
                                <p>{ticket.attendeeEmail}</p>
                                {ticket.qrImageUrl && <img className="ticket-qr" src={ticket.qrImageUrl} alt={`QR code for ${ticket.attendeeName}`} />}
                                <p><strong>{ticket.ticketCode}</strong></p>
                                <p>Status: {ticket.status}</p>
                                <a className="button secondary" href={ticket.ticketUrl}>Open Ticket</a>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="actions compact-actions">
                          <a className="button secondary" href={order.orderUrl}>Open Order</a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
