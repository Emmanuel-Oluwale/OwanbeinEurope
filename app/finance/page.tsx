'use client';

import { useEffect, useMemo, useState } from 'react';
import { OrganizerGate } from '@/app/components/OrganizerGate';

type FinanceOrder = {
  id: string;
  created_at: string;
  order_number: string;
  full_name: string;
  email: string;
  phone: string | null;
  total_amount: number;
  payment_status: string;
  variable_symbol: string;
  payment_account_label: string;
  approved_at?: string | null;
  approved_by?: string | null;
  order_attendees?: Array<{
    attendee_name: string;
    attendee_email: string;
  }>;
  tickets?: Array<{
    ticket_code: string;
    attendee_name: string;
    attendee_email: string;
    status: string;
  }>;
};

type FinanceScope = {
  email?: string;
  role?: string;
  handler?: string | null;
  isAdmin?: boolean;
};

export default function FinancePage() {
  const [orders, setOrders] = useState<FinanceOrder[]>([]);
  const [scope, setScope] = useState<FinanceScope | null>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'paid' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FinanceOrder | null>(null);

  async function loadOrders() {
    setLoading(true);
    const response = await fetch(`/api/finance/orders?status=${statusFilter}`);
    const data = await response.json();
    setOrders(data.orders || []);
    setScope(data.scope || null);
    setMessage(data.error || data.warning || '');
    setLoading(false);
  }

  async function approve(orderId: string) {
    setApprovingId(orderId);
    setMessage('Approving payment...');
    const response = await fetch('/api/finance/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    const data = await response.json();
    setMessage(data.error || 'Payment approved and tickets issued.');
    setSelectedOrder(null);
    setApprovingId(null);
    await loadOrders();
  }

  async function resendPayment(orderId: string) {
    setResendingId(orderId);
    setMessage('Resending payment instructions...');
    const response = await fetch('/api/admin/resend/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    const data = await response.json();
    setMessage(data.error || data.message || 'Payment instructions resent.');
    setResendingId(null);
  }

  async function resendTickets(orderId: string) {
    setResendingId(orderId);
    setMessage('Resending ticket email...');
    const response = await fetch('/api/admin/resend/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    const data = await response.json();
    setMessage(data.error || data.message || 'Ticket email resent.');
    setResendingId(null);
  }

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) => {
      const haystack = [
        order.order_number,
        order.full_name,
        order.email,
        order.phone || '',
        order.variable_symbol,
        order.payment_account_label,
        ...(order.order_attendees || []).flatMap((attendee) => [attendee.attendee_name, attendee.attendee_email])
      ].join(' ').toLowerCase();

      return haystack.includes(term);
    });
  }, [orders, search]);

  const pendingAmount = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const visibleAmount = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const oldestOrder = orders[0];

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe Finance</a>
          <div className="nav-links">
            <a href="/checkin">Check-in</a>
            <a className="button secondary compact" href="/api/admin/exports/finance">Export CSV</a>
            <button className="button secondary compact" type="button" onClick={loadOrders}>Refresh</button>
          </div>
        </nav>
      </header>
      <OrganizerGate area="finance">
        <section className="section">
          <div className="container">
            <p className="kicker">Finance Dashboard</p>
            <h1 className="section-title">Payment approvals.</h1>
            <p className="muted">
              {scope?.isAdmin
                ? 'Admin view: you can see all finance orders and approve pending payments.'
                : scope?.handler
                  ? `Handler view: you can only see and approve orders assigned to ${scope.handler}.`
                  : 'Your account is not linked to a payment handler.'}
            </p>

            {message && <div className={`result-box ${message.toLowerCase().includes('cannot') || message.toLowerCase().includes('not linked') || message.toLowerCase().includes('error') ? 'error' : ''}`}>{message}</div>}

            <div className="grid four">
              <article className="card">
                <p className="kicker">Pending Orders</p>
                <h3>{orders.length}</h3>
                <p className="muted">Awaiting confirmation</p>
              </article>
              <article className="card">
                <p className="kicker">Pending Amount</p>
                <h3>{pendingAmount.toLocaleString('cs-CZ')} CZK</h3>
                <p className="muted">Total visible queue</p>
              </article>
              <article className="card">
                <p className="kicker">Visible After Search</p>
                <h3>{filteredOrders.length}</h3>
                <p className="muted">{visibleAmount.toLocaleString('cs-CZ')} CZK</p>
              </article>
              <article className="card">
                <p className="kicker">Oldest Pending</p>
                <h3>{oldestOrder ? new Date(oldestOrder.created_at).toLocaleDateString() : 'None'}</h3>
                <p className="muted">{oldestOrder ? oldestOrder.order_number : 'All clear'}</p>
              </article>
            </div>

            <div className="summary-panel">
              <div className="actions compact-actions">
                {(['pending', 'paid', 'all'] as const).map((status) => (
                  <button
                    className={`button ${statusFilter === status ? 'green' : 'secondary'}`}
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All Orders' : status[0].toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <label className="field-label">Search orders</label>
              <input
                className="field"
                placeholder="Search by order number, buyer, email, variable symbol, handler, or attendee"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {loading ? (
              <div className="result-box">Loading finance orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="result-box">No finance orders found.</div>
            ) : (
              <div className="grid two">
                {filteredOrders.map((order) => (
                  <article className="card" key={order.id}>
                    <div className="split-row">
                      <div>
                        <p className="kicker">{order.order_number}</p>
                        <h3>{order.full_name}</h3>
                      </div>
                      <strong>{order.payment_account_label}</strong>
                    </div>
                    <p className="muted">Buyer Email: {order.email}</p>
                    {order.phone && <p className="muted">Phone: {order.phone}</p>}
                    <p className="price">{order.total_amount.toLocaleString('cs-CZ')} CZK</p>
                    <div className="payment-details">
                      <p><span>Handler</span><strong>{order.payment_account_label}</strong></p>
                      <p><span>Variable Symbol</span><strong>{order.variable_symbol}</strong></p>
                      <p><span>Status</span><strong>{order.payment_status}</strong></p>
                      <p><span>Created</span><strong>{new Date(order.created_at).toLocaleString()}</strong></p>
                      {order.approved_at && <p><span>Approved</span><strong>{new Date(order.approved_at).toLocaleString()}</strong></p>}
                      {order.approved_by && <p><span>Approved By</span><strong>{order.approved_by}</strong></p>}
                    </div>
                    <div className="attendee-list">
                      <p className="kicker">Attendees</p>
                      {order.order_attendees?.map((attendee) => (
                        <p key={`${order.id}-${attendee.attendee_email}`}>{attendee.attendee_name} - {attendee.attendee_email}</p>
                      ))}
                    </div>
                    <div className="actions compact-actions">
                      {order.payment_status === 'pending' && (
                        <>
                          <button className="button secondary" type="button" onClick={() => resendPayment(order.id)} disabled={resendingId === order.id}>
                            {resendingId === order.id ? 'Resending...' : 'Resend Payment Email'}
                          </button>
                          <button className="button green" type="button" onClick={() => setSelectedOrder(order)}>Review & Approve</button>
                        </>
                      )}
                      {order.payment_status === 'paid' && (
                        <>
                          <a className="button secondary" href={`/my-ticket?order=${encodeURIComponent(order.order_number)}`}>Open Tickets</a>
                          <button className="button green" type="button" onClick={() => resendTickets(order.id)} disabled={resendingId === order.id}>
                            {resendingId === order.id ? 'Resending...' : 'Resend Ticket Email'}
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {selectedOrder && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <p className="kicker">Confirm Payment Received</p>
              <h2>{selectedOrder.order_number}</h2>
              <p className="muted">Only approve this order if the money has arrived in the assigned handler account.</p>
              <div className="payment-details">
                <p><span>Buyer</span><strong>{selectedOrder.full_name}</strong></p>
                <p><span>Amount</span><strong>{selectedOrder.total_amount.toLocaleString('cs-CZ')} CZK</strong></p>
                <p><span>Handler</span><strong>{selectedOrder.payment_account_label}</strong></p>
                <p><span>Variable Symbol</span><strong>{selectedOrder.variable_symbol}</strong></p>
              </div>
              <div className="notice">
                <p>Approving will mark payment as paid, issue tickets, update inventory, and send the ticket email.</p>
              </div>
              <div className="actions compact-actions">
                <button className="button secondary" type="button" onClick={() => setSelectedOrder(null)} disabled={approvingId === selectedOrder.id}>Cancel</button>
                <button className="button green" type="button" onClick={() => approve(selectedOrder.id)} disabled={approvingId === selectedOrder.id}>
                  {approvingId === selectedOrder.id ? 'Approving...' : 'Confirm & Issue Tickets'}
                </button>
              </div>
            </div>
          </div>
        )}
      </OrganizerGate>
    </main>
  );
}
