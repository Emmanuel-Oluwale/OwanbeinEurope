'use client';

import { useEffect, useState } from 'react';
import { OrganizerGate } from '@/app/components/OrganizerGate';

type TicketSetting = {
  id: string;
  name: string;
  description: string;
  priceCzk: number;
  quantityAvailable: number;
  quantitySold: number;
  saleStart: string | null;
  saleEnd: string | null;
  showOnSite: boolean;
  active: boolean;
};

function toDateTimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export default function AdminSettingsPage() {
  const [tickets, setTickets] = useState<TicketSetting[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    setLoading(true);
    const response = await fetch('/api/admin/settings/tickets');
    const data = await response.json();
    setTickets(data.tickets || []);
    setMessage(data.error || '');
    setLoading(false);
  }

  function updateTicket(id: string, patch: Partial<TicketSetting>) {
    setTickets((current) => current.map((ticket) => ticket.id === id ? { ...ticket, ...patch } : ticket));
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('Saving ticket settings...');
    const response = await fetch('/api/admin/settings/tickets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets })
    });
    const data = await response.json();
    setMessage(data.error || data.message || 'Ticket settings saved.');
    setSaving(false);
    await loadSettings();
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/organizer">Owanbe Settings</a>
          <div className="nav-links">
            <a href="/organizer">Organizer</a>
            <a href="/admin/media">Media</a>
            <button className="button secondary compact" type="button" onClick={loadSettings}>Refresh</button>
          </div>
        </nav>
      </header>

      <OrganizerGate area="admin" nextPath="/admin/settings">
        <section className="section">
          <div className="container">
            <p className="kicker">Event Settings</p>
            <h1 className="section-title">Manage live ticket settings.</h1>
            <p className="muted">Changes here affect checkout availability and public ticket visibility.</p>

            {message && <div className={`result-box ${message.toLowerCase().includes('could not') || message.toLowerCase().includes('required') || message.toLowerCase().includes('valid') ? 'error' : ''}`}>{message}</div>}

            {loading ? (
              <div className="result-box">Loading settings...</div>
            ) : (
              <form className="checkout-form" onSubmit={saveSettings}>
                <div className="grid two">
                  {tickets.map((ticket) => {
                    const remaining = Math.max(Number(ticket.quantityAvailable || 0) - Number(ticket.quantitySold || 0), 0);

                    return (
                      <article className="card" key={ticket.id}>
                        <p className="kicker">Ticket Tier</p>
                        <h3>{ticket.name}</h3>
                        <p className="muted">{ticket.quantitySold} sold, {remaining} remaining</p>

                        <label className="field-label">Description</label>
                        <textarea className="field" value={ticket.description} onChange={(event) => updateTicket(ticket.id, { description: event.target.value })} />

                        <label className="field-label">Price CZK</label>
                        <input className="field" min="0" type="number" value={ticket.priceCzk} onChange={(event) => updateTicket(ticket.id, { priceCzk: Number(event.target.value) })} />

                        <label className="field-label">Total Quantity</label>
                        <input className="field" min="0" type="number" value={ticket.quantityAvailable} onChange={(event) => updateTicket(ticket.id, { quantityAvailable: Number(event.target.value) })} />

                        <label className="field-label">Sale Start</label>
                        <input className="field" type="datetime-local" value={toDateTimeLocal(ticket.saleStart)} onChange={(event) => updateTicket(ticket.id, { saleStart: fromDateTimeLocal(event.target.value) })} />

                        <label className="field-label">Sale End</label>
                        <input className="field" type="datetime-local" value={toDateTimeLocal(ticket.saleEnd)} onChange={(event) => updateTicket(ticket.id, { saleEnd: fromDateTimeLocal(event.target.value) })} />

                        <div className="toggle-row">
                          <label><input type="checkbox" checked={ticket.showOnSite} onChange={(event) => updateTicket(ticket.id, { showOnSite: event.target.checked })} /> Show on site</label>
                          <label><input type="checkbox" checked={ticket.active} onChange={(event) => updateTicket(ticket.id, { active: event.target.checked })} /> Active</label>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <button className="button primary submit-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Ticket Settings'}</button>
              </form>
            )}
          </div>
        </section>
      </OrganizerGate>
    </main>
  );
}
