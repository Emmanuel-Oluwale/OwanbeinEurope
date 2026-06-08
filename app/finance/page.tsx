'use client';

import { useEffect, useState } from 'react';

type FinanceOrder = {
  id: string;
  created_at: string;
  order_number: string;
  full_name: string;
  email: string;
  phone: string | null;
  total_amount: number;
  variable_symbol: string;
  payment_account_label: string;
  order_attendees?: Array<{
    attendee_name: string;
    attendee_email: string;
  }>;
};

export default function FinancePage() {
  const [orders, setOrders] = useState<FinanceOrder[]>([]);
  const [message, setMessage] = useState('');

  async function loadOrders() {
    const response = await fetch('/api/finance/orders');
    const data = await response.json();
    setOrders(data.orders || []);
    if (data.error) setMessage(data.error);
  }

  async function approve(orderId: string) {
    setMessage('Approving payment...');
    const response = await fetch('/api/finance/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, approvedBy: 'finance' })
    });
    const data = await response.json();
    setMessage(data.error || 'Payment approved and tickets issued.');
    await loadOrders();
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe Finance</a>
          <a className="button secondary compact" href="/checkin">Check-in</a>
        </nav>
      </header>
      <section className="section">
        <div className="container">
          <p className="kicker">Finance v1</p>
          <h1 className="section-title">Pending payment approvals.</h1>
          {message && <div className="result-box">{message}</div>}
          <div className="grid two">
            {orders.map((order) => (
              <article className="card" key={order.id}>
                <p className="kicker">{order.order_number}</p>
                <h3>{order.full_name}</h3>
                <p className="muted">{order.email} {order.phone ? `- ${order.phone}` : ''}</p>
                <p className="price">{order.total_amount.toLocaleString('cs-CZ')} CZK</p>
                <p className="muted">VS: {order.variable_symbol}</p>
                <p className="muted">Account: {order.payment_account_label}</p>
                <div className="attendee-list">
                  {order.order_attendees?.map((attendee) => (
                    <p key={`${order.id}-${attendee.attendee_email}`}>{attendee.attendee_name} - {attendee.attendee_email}</p>
                  ))}
                </div>
                <button className="button green submit-button" type="button" onClick={() => approve(order.id)}>Approve Payment</button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
