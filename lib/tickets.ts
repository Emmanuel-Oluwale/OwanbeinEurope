import { ticketOptions } from '@/lib/eventData';

export type PublicTicket = {
  id: string;
  name: string;
  description: string;
  priceCzk: number;
  quantityAvailable: number;
  quantitySold: number;
  remaining: number;
  saleEnd: string | null;
  showOnSite: boolean;
  visible: boolean;
  soldOut: boolean;
};

export function ticketIdFromName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getFallbackTickets(): PublicTicket[] {
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

export function isTicketVisible(ticket: {
  quantity_available?: number | null;
  quantity_sold?: number | null;
  sale_start?: string | null;
  sale_end?: string | null;
  show_on_site?: boolean | null;
}) {
  const now = Date.now();
  const saleStart = ticket.sale_start ? new Date(ticket.sale_start).getTime() : 0;
  const saleEnd = ticket.sale_end ? new Date(ticket.sale_end).getTime() : Number.MAX_SAFE_INTEGER;
  const remaining = Number(ticket.quantity_available || 0) - Number(ticket.quantity_sold || 0);

  return Boolean(ticket.show_on_site) && now >= saleStart && now <= saleEnd && remaining > 0;
}
