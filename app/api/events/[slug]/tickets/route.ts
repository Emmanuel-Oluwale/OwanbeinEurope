import { NextResponse } from 'next/server';
import { eventSlug } from '@/lib/eventData';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getFallbackTickets, isTicketVisible, ticketIdFromName } from '@/lib/tickets';

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  if (slug !== eventSlug) {
    return NextResponse.json({ error: 'Unknown event.' }, { status: 404 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: eventRow, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('slug', slug)
      .single();

    if (eventError || !eventRow) {
      return NextResponse.json({ tickets: getFallbackTickets(), source: 'fallback' });
    }

    const { data, error } = await supabase
      .from('ticket_types')
      .select('id, name, description, price_czk, quantity_available, quantity_sold, sale_start, sale_end, active, show_on_site')
      .eq('event_id', eventRow.id)
      .eq('active', true)
      .order('price_czk', { ascending: true });

    if (error || !data) {
      return NextResponse.json({ tickets: getFallbackTickets(), source: 'fallback' });
    }

    const tickets = data
      .map((ticket) => {
        const remaining = Number(ticket.quantity_available || 0) - Number(ticket.quantity_sold || 0);
        return {
          id: ticketIdFromName(ticket.name),
          name: ticket.name,
          description: ticket.description || '',
          priceCzk: Number(ticket.price_czk || 0),
          quantityAvailable: Number(ticket.quantity_available || 0),
          quantitySold: Number(ticket.quantity_sold || 0),
          remaining,
          saleEnd: ticket.sale_end,
          showOnSite: Boolean(ticket.show_on_site),
          visible: isTicketVisible(ticket),
          soldOut: remaining <= 0
        };
      })
      .filter((ticket) => ticket.visible || ticket.soldOut);

    return NextResponse.json({ tickets, source: 'supabase' });
  } catch {
    return NextResponse.json({ tickets: getFallbackTickets(), source: 'fallback' });
  }
}
