import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { eventSlug, getTicketOption } from '@/lib/eventData';
import { paymentInstructionsHtml, sendBrevoEmail } from '@/lib/brevo';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { buildOrderNumber, buildQrPlatbaPayload, buildSequence, buildVariableSymbol, pickPaymentAccount, sanitizeEmail } from '@/lib/orderUtils';
import { safeFilePart, uploadQrDataUrl } from '@/lib/qrStorage';

type CreateOrderPayload = {
  eventSlug?: string;
  ticketType?: string;
  quantity?: number;
  buyer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  attendees?: Array<{
    fullName?: string;
    email?: string;
    phone?: string;
  }>;
};

export async function POST(request: Request) {
  try {
    const payload = await request.json() as CreateOrderPayload;
    const requestedEventSlug = payload.eventSlug || eventSlug;
    const quantity = Number(payload.quantity || 0);
    const ticket = getTicketOption(payload.ticketType || '');
    const buyerName = payload.buyer?.fullName?.trim();
    const buyerEmail = sanitizeEmail(payload.buyer?.email || '');
    const attendees = payload.attendees || [];

    if (requestedEventSlug !== eventSlug) {
      return NextResponse.json({ error: 'Unknown event.' }, { status: 400 });
    }

    if (!ticket || quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: 'Choose a valid ticket tier and quantity.' }, { status: 400 });
    }

    if (!buyerName || !buyerEmail) {
      return NextResponse.json({ error: 'Buyer name and email are required.' }, { status: 400 });
    }

    if (attendees.length !== quantity || attendees.some((attendee) => !attendee.fullName?.trim() || !attendee.email?.trim())) {
      return NextResponse.json({ error: 'Each ticket needs an attendee name and email.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: eventRow, error: eventError } = await supabase
      .from('events')
      .select('id, slug')
      .eq('slug', requestedEventSlug)
      .single();

    if (eventError || !eventRow) {
      return NextResponse.json({ error: 'Event is not available in Supabase yet.' }, { status: 404 });
    }

    const { data: ticketTypeRow, error: ticketTypeError } = await supabase
      .from('ticket_types')
      .select('id, price_czk, quantity_available, quantity_sold')
      .eq('event_id', eventRow.id)
      .ilike('name', ticket.name)
      .eq('active', true)
      .single();

    if (ticketTypeError || !ticketTypeRow) {
      return NextResponse.json({ error: 'Ticket tier is not available in Supabase yet.' }, { status: 404 });
    }

    const remaining = Number(ticketTypeRow.quantity_available || 0) - Number(ticketTypeRow.quantity_sold || 0);
    if (remaining < quantity) {
      return NextResponse.json({ error: `Only ${Math.max(remaining, 0)} tickets remaining for this tier.` }, { status: 409 });
    }

    const duplicateWindow = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentOrders, error: duplicateError } = await supabase
      .from('orders')
      .select('id, order_number, variable_symbol, total_amount, payment_status, order_attendees(id, ticket_type_id)')
      .eq('event_id', eventRow.id)
      .eq('email', buyerEmail)
      .eq('payment_status', 'pending')
      .gte('created_at', duplicateWindow)
      .order('created_at', { ascending: false });

    if (duplicateError) {
      return NextResponse.json({ error: 'Could not check for duplicate pending orders.' }, { status: 500 });
    }

    const matchingPendingOrder = recentOrders?.find((order) => {
      const orderAttendees = order.order_attendees || [];
      return orderAttendees.length === quantity && orderAttendees.every((attendee) => attendee.ticket_type_id === ticketTypeRow.id);
    });

    if (matchingPendingOrder) {
      return NextResponse.json({
        existingOrder: true,
        orderNumber: matchingPendingOrder.order_number,
        variableSymbol: matchingPendingOrder.variable_symbol,
        amountCzk: matchingPendingOrder.total_amount,
        paymentStatus: 'pending',
        message: 'A matching pending order already exists.'
      });
    }

    const { count, error: countError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventRow.id);

    if (countError) {
      return NextResponse.json({ error: 'Could not prepare order number.' }, { status: 500 });
    }

    const existingOrderCount = count || 0;
    const sequence = buildSequence(existingOrderCount);
    const orderNumber = buildOrderNumber(sequence);
    const variableSymbol = buildVariableSymbol(sequence);
    const paymentAccount = pickPaymentAccount(existingOrderCount);
    const amountCzk = Number(ticketTypeRow.price_czk) * quantity;
    const qrPlatbaPayload = buildQrPlatbaPayload(paymentAccount, amountCzk, variableSymbol, orderNumber);
    const paymentQrCode = qrPlatbaPayload ? await QRCode.toDataURL(qrPlatbaPayload, { margin: 1, width: 320 }) : null;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        email: buyerEmail,
        full_name: buyerName,
        phone: payload.buyer?.phone?.trim() || null,
        total_amount: amountCzk,
        payment_status: 'pending',
        event_id: eventRow.id,
        variable_symbol: variableSymbol,
        payment_account_label: paymentAccount.label
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Could not create order.' }, { status: 500 });
    }

    let paymentQrUrl: string | null = null;
    try {
      paymentQrUrl = await uploadQrDataUrl(paymentQrCode, `qr/payment/${safeFilePart(orderNumber)}.png`);
      if (paymentQrUrl) {
        await supabase
          .from('orders')
          .update({ payment_qr_url: paymentQrUrl })
          .eq('id', order.id);
      }
    } catch (qrError) {
      console.error('Payment QR storage failed', qrError);
    }

    const attendeeRows = attendees.map((attendee) => ({
      order_id: order.id,
      ticket_type_id: ticketTypeRow.id,
      attendee_name: attendee.fullName?.trim(),
      attendee_email: sanitizeEmail(attendee.email || ''),
      attendee_phone: attendee.phone?.trim() || null
    }));

    const { error: attendeeError } = await supabase.from('order_attendees').insert(attendeeRows);

    if (attendeeError) {
      return NextResponse.json({ error: 'Order was created, but attendee records could not be saved. Add the order_attendees table from README.' }, { status: 500 });
    }

    try {
      await sendBrevoEmail({
        to: buyerEmail,
        toName: buyerName,
        subject: `Payment instructions for ${orderNumber}`,
        emailType: 'payment_instructions',
        orderId: order.id,
        html: paymentInstructionsHtml({
          name: buyerName,
          orderNumber,
          amountCzk,
          variableSymbol,
          accountName: paymentAccount.name,
          iban: paymentAccount.iban,
          bic: paymentAccount.bic,
          paymentQrUrl,
          orderLookupUrl: `https://owanbeineurope.cz/my-ticket?order=${encodeURIComponent(orderNumber)}`
        })
      });
    } catch (emailError) {
      console.error('Payment instruction email failed', emailError);
    }

    return NextResponse.json({
      orderNumber,
      variableSymbol,
      amountCzk,
      paymentStatus: 'pending',
      accountName: paymentAccount.name,
      iban: paymentAccount.iban,
      bic: paymentAccount.bic,
      paymentQrCode,
      paymentAccountPlaceholder: paymentAccount.isPlaceholder,
      instructions: paymentAccount.isPlaceholder
        ? 'Payment account details are placeholders for now. Replace the Vercel payment env vars before accepting live payments.'
        : `Send ${amountCzk.toLocaleString('cs-CZ')} CZK by bank transfer and include variable symbol ${variableSymbol}. Tickets are issued after finance approval.`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create order.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
