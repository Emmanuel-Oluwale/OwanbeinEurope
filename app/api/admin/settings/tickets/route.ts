import { NextResponse } from 'next/server';
import { eventSlug } from '@/lib/eventData';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireOrganizerRole } from '@/lib/organizerAuth';

type TicketUpdate = {
  id?: string;
  description?: string;
  priceCzk?: number;
  quantityAvailable?: number;
  saleStart?: string | null;
  saleEnd?: string | null;
  showOnSite?: boolean;
  active?: boolean;
};

export async function GET() {
  const auth = await requireOrganizerRole(['admin']);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabaseAdmin();
  const { data: eventRow, error: eventError } = await supabase
    .from('events')
    .select('id, title, slug')
    .eq('slug', eventSlug)
    .single();

  if (eventError || !eventRow) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('ticket_types')
    .select('id, name, description, price_czk, quantity_available, quantity_sold, sale_start, sale_end, show_on_site, active')
    .eq('event_id', eventRow.id)
    .order('price_czk', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Could not load ticket settings.' }, { status: 500 });
  }

  return NextResponse.json({
    event: eventRow,
    tickets: (data || []).map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      description: ticket.description || '',
      priceCzk: Number(ticket.price_czk || 0),
      quantityAvailable: Number(ticket.quantity_available || 0),
      quantitySold: Number(ticket.quantity_sold || 0),
      saleStart: ticket.sale_start,
      saleEnd: ticket.sale_end,
      showOnSite: Boolean(ticket.show_on_site),
      active: Boolean(ticket.active)
    }))
  });
}

export async function PUT(request: Request) {
  const auth = await requireOrganizerRole(['admin']);
  if (!auth.authorized) return auth.response;

  const payload = await request.json() as { tickets?: TicketUpdate[] };
  const updates = payload.tickets || [];

  if (!updates.length) {
    return NextResponse.json({ error: 'Ticket updates are required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  for (const ticket of updates) {
    if (!ticket.id) {
      return NextResponse.json({ error: 'Every ticket update needs an ID.' }, { status: 400 });
    }

    const priceCzk = Number(ticket.priceCzk);
    const quantityAvailable = Number(ticket.quantityAvailable);

    if (!Number.isFinite(priceCzk) || priceCzk < 0 || !Number.isFinite(quantityAvailable) || quantityAvailable < 0) {
      return NextResponse.json({ error: 'Ticket price and quantity must be valid non-negative numbers.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('ticket_types')
      .update({
        description: ticket.description || '',
        price_czk: Math.round(priceCzk),
        quantity_available: Math.round(quantityAvailable),
        sale_start: ticket.saleStart || null,
        sale_end: ticket.saleEnd || null,
        show_on_site: Boolean(ticket.showOnSite),
        active: Boolean(ticket.active)
      })
      .eq('id', ticket.id);

    if (error) {
      return NextResponse.json({ error: 'Could not save ticket settings.' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, message: 'Ticket settings saved.' });
}
