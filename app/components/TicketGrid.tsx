'use client';

import { useEffect, useState } from 'react';
import { ticketOptions } from '@/lib/eventData';
import type { PublicTicket } from '@/lib/tickets';

function fallbackTickets(): PublicTicket[] {
  return ticketOptions.map((ticket) => ({
    id: ticket.id,
    name: ticket.name,
    description: ticket.description,
    priceCzk: ticket.price,
    quantityAvailable: ticket.quantityAvailable,
    quantitySold: 0,
    remaining: ticket.quantityAvailable,
    saleEnd: null,
    showOnSite: true,
    visible: true,
    soldOut: false
  }));
}

export function TicketGrid() {
  const [tickets, setTickets] = useState<PublicTicket[]>(fallbackTickets());

  useEffect(() => {
    async function loadTickets() {
      const response = await fetch('/api/events/naija-to-prague-2026/tickets');
      const data = await response.json();
      if (data.tickets?.length) {
        setTickets(data.tickets);
      }
    }

    loadTickets();
  }, []);

  return (
    <div className="grid four">
      {tickets.map((ticket) => (
        <article className={`card ticket-card ${ticket.soldOut ? 'sold-out' : ''}`} key={ticket.id}>
          <h3>{ticket.name}</h3>
          <div className="price">{ticket.priceCzk.toLocaleString('cs-CZ')} CZK</div>
          <p className="muted">{ticket.description}</p>
          <p className="muted ticket-status">{ticket.soldOut ? 'Sold Out' : 'Available now'}</p>
          {!ticket.soldOut && <a className="button secondary submit-button" href="/checkout">Reserve Spot</a>}
        </article>
      ))}
    </div>
  );
}
