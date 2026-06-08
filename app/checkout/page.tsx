'use client';

import { useEffect, useMemo, useState } from 'react';
import { ticketOptions } from '@/lib/eventData';

type Attendee = {
  fullName: string;
  email: string;
  phone: string;
};

type OrderResult = {
  error?: string;
  orderNumber?: string;
  variableSymbol?: string;
  amountCzk?: number;
  accountName?: string;
  iban?: string;
  paymentQrCode?: string | null;
  paymentAccountPlaceholder?: boolean;
  paymentStatus?: string;
  instructions?: string;
};

const blankAttendee = (): Attendee => ({ fullName: '', email: '', phone: '' });
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;

function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return MIN_QUANTITY;
  return Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, Math.floor(value)));
}

export default function CheckoutPage() {
  const [ticketType, setTicketType] = useState('early-bird');
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [buyerFullName, setBuyerFullName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([blankAttendee()]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const orderCreated = Boolean(result?.orderNumber && !result.error);

  const selected = ticketOptions.find((item) => item.id === ticketType) || ticketOptions[0];
  const total = selected.price * quantity;

  useEffect(() => {
    setAttendees((current) => {
      const next = [...current];
      while (next.length < quantity) next.push(blankAttendee());
      return next.slice(0, quantity);
    });
  }, [quantity]);

  const canSubmit = useMemo(() => {
    return !orderCreated && buyerFullName.trim() && buyerEmail.trim() && quantity >= MIN_QUANTITY && attendees.every((attendee) => attendee.fullName.trim() && attendee.email.trim());
  }, [attendees, buyerEmail, buyerFullName, orderCreated, quantity]);

  function startNewOrder() {
    setResult(null);
    setTicketType('early-bird');
    setQuantity(1);
    setQuantityInput('1');
    setBuyerFullName('');
    setBuyerEmail('');
    setBuyerPhone('');
    setAttendees([blankAttendee()]);
  }

  function setTypedQuantity(value: string) {
    if (orderCreated) return;
    const digitsOnly = value.replace(/[^0-9]/g, '');
    setQuantityInput(digitsOnly);

    if (!digitsOnly) {
      return;
    }

    const nextQuantity = clampQuantity(Number(digitsOnly));
    setQuantity(nextQuantity);

    if (String(nextQuantity) !== digitsOnly) {
      setQuantityInput(String(nextQuantity));
    }
  }

  function commitQuantity() {
    const nextQuantity = clampQuantity(Number(quantityInput || MIN_QUANTITY));
    setQuantity(nextQuantity);
    setQuantityInput(String(nextQuantity));
  }

  function adjustQuantity(delta: number) {
    if (orderCreated) return;
    const nextQuantity = clampQuantity(quantity + delta);
    setQuantity(nextQuantity);
    setQuantityInput(String(nextQuantity));
  }

  function updateAttendee(index: number, field: keyof Attendee, value: string) {
    if (orderCreated) return;
    setAttendees((current) => current.map((attendee, attendeeIndex) => attendeeIndex === index ? { ...attendee, [field]: value } : attendee));
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || orderCreated) return;

    commitQuantity();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug: 'naija-to-prague-2026',
          ticketType,
          quantity,
          buyer: {
            fullName: buyerFullName,
            email: buyerEmail,
            phone: buyerPhone
          },
          attendees
        })
      });

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: 'Could not create the order. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe in Europe</a>
          <div className="nav-links">
            <a href="/events/naija-to-prague-2026">Event</a>
            <a href="/my-ticket">Find My Ticket</a>
          </div>
        </nav>
      </header>

      <section className="section checkout-section">
        <div className="container grid checkout-grid">
          <div>
            <p className="kicker">Checkout</p>
            <h1 className="section-title checkout-title">Reserve your spot.</h1>
            <p className="muted">One buyer can reserve multiple tickets. Type the number of tickets you want, then add each attendee below so finance can issue one ticket and QR-ready code per person after payment approval.</p>
            <div className="summary-panel">
              <p className="kicker">Order Summary</p>
              <h2>{selected.name}</h2>
              <p>{quantity} x {selected.price.toLocaleString('cs-CZ')} CZK</p>
              <div className="price">{total.toLocaleString('cs-CZ')} CZK</div>
              {orderCreated && <p className="success-text">Order created. This checkout is now locked to prevent duplicate orders.</p>}
            </div>
          </div>

          <form className="checkout-form" onSubmit={submitOrder}>
            <fieldset disabled={loading || orderCreated} className="checkout-fieldset">
              <section className="form-section">
                <p className="kicker">Ticket Tier</p>
                <div className="ticket-picker">
                  {ticketOptions.map((ticket) => (
                    <button
                      className={`ticket-choice ${ticket.id === ticketType ? 'selected' : ''}`}
                      key={ticket.id}
                      onClick={() => setTicketType(ticket.id)}
                      type="button"
                    >
                      <span>{ticket.name}</span>
                      <strong>{ticket.price.toLocaleString('cs-CZ')} CZK</strong>
                    </button>
                  ))}
                </div>
                <label className="field-label" htmlFor="ticket-quantity">Number of tickets</label>
                <div className="quantity-control">
                  <button className="quantity-button" type="button" onClick={() => adjustQuantity(-1)} aria-label="Reduce ticket quantity">-</button>
                  <input
                    id="ticket-quantity"
                    className="field quantity-field"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={quantityInput}
                    onBlur={commitQuantity}
                    onChange={(event) => setTypedQuantity(event.target.value)}
                    placeholder="Type number"
                  />
                  <button className="quantity-button" type="button" onClick={() => adjustQuantity(1)} aria-label="Increase ticket quantity">+</button>
                </div>
                <p className="small">You can type any number from {MIN_QUANTITY} to {MAX_QUANTITY}. Attendee fields update automatically.</p>
              </section>

              <section className="form-section">
                <p className="kicker">Buyer Details</p>
                <label className="field-label">Buyer full name</label>
                <input className="field" required value={buyerFullName} onChange={(event) => setBuyerFullName(event.target.value)} />
                <label className="field-label">Buyer email</label>
                <input className="field" required type="email" value={buyerEmail} onChange={(event) => setBuyerEmail(event.target.value)} />
                <label className="field-label">Buyer phone</label>
                <input className="field" value={buyerPhone} onChange={(event) => setBuyerPhone(event.target.value)} />
              </section>

              <section className="form-section">
                <p className="kicker">Attendee Details</p>
                {attendees.map((attendee, index) => (
                  <div className="attendee-box" key={index}>
                    <h3>Attendee {index + 1}</h3>
                    <label className="field-label">Full name</label>
                    <input className="field" required value={attendee.fullName} onChange={(event) => updateAttendee(index, 'fullName', event.target.value)} />
                    <label className="field-label">Email</label>
                    <input className="field" required type="email" value={attendee.email} onChange={(event) => updateAttendee(index, 'email', event.target.value)} />
                    <label className="field-label">Phone optional</label>
                    <input className="field" value={attendee.phone} onChange={(event) => updateAttendee(index, 'phone', event.target.value)} />
                  </div>
                ))}
              </section>
            </fieldset>

            <button className="button primary submit-button" type="submit" disabled={loading || !canSubmit || orderCreated}>
              {orderCreated ? 'Order Created' : loading ? 'Creating order...' : 'Create Order'}
            </button>

            {result && (
              <div className={`result-box ${result.error ? 'error' : ''}`}>
                {result.error ? (
                  <p>{result.error}</p>
                ) : (
                  <>
                    <p className="kicker">Order Created</p>
                    <h3>{result.orderNumber}</h3>
                    <p>Amount: {result.amountCzk?.toLocaleString('cs-CZ')} CZK</p>
                    <p>Variable symbol: <strong>{result.variableSymbol}</strong></p>
                    <p>Account holder: {result.accountName}</p>
                    <p>IBAN: {result.iban}</p>
                    {result.paymentQrCode && <img className="ticket-qr" src={result.paymentQrCode} alt="Bank transfer QR payment code" />}
                    {result.paymentAccountPlaceholder && <p className="warning-text">Payment details are placeholders until the real Vercel payment variables are added.</p>}
                    <p>{result.instructions}</p>
                    <div className="actions compact-actions">
                      <a className="button secondary" href="/my-ticket">Find this order later</a>
                      <button className="button green" type="button" onClick={startNewOrder}>Start a new order</button>
                    </div>
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
