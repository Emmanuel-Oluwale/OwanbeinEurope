import { getSupabaseAdmin } from './supabaseAdmin';

type EmailInput = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  emailType: string;
  orderId?: string;
};

export async function sendBrevoEmail(input: EmailInput) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'info@owanbeineurope.cz';
  const senderName = process.env.BREVO_SENDER_NAME || 'Owanbe in Europe';

  if (!apiKey) {
    await logEmail(input, 'skipped', undefined, 'Missing BREVO_API_KEY');
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: input.to, name: input.toName || input.to }],
        subject: input.subject,
        htmlContent: input.html,
        textContent: input.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      })
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      await logEmail(input, 'failed', undefined, JSON.stringify(body));
      return;
    }

    await logEmail(input, 'sent', body.messageId, undefined);
  } catch (error) {
    await logEmail(input, 'failed', undefined, error instanceof Error ? error.message : 'Unknown Brevo error');
  }
}

async function logEmail(input: EmailInput, status: string, brevoMessageId?: string, errorMessage?: string) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('email_logs').insert({
      recipient: input.to,
      subject: input.subject,
      email_type: input.emailType,
      status,
      order_id: input.orderId || null,
      brevo_message_id: brevoMessageId || null,
      error_message: errorMessage || null
    });
  } catch (error) {
    console.error('Could not write email log', error);
  }
}

export function paymentInstructionsHtml(input: {
  name: string;
  orderNumber: string;
  amountCzk: number;
  variableSymbol: string;
  accountName: string;
  iban: string;
  bic?: string;
  paymentQrUrl?: string | null;
  orderLookupUrl?: string;
}) {
  const orderLookupUrl = input.orderLookupUrl || `https://owanbeineurope.cz/my-ticket?order=${encodeURIComponent(input.orderNumber)}`;
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h1>Owanbe in Europe - order received</h1><p>Hello ${escapeHtml(input.name)},</p><h2>Complete your payment</h2><p>Your reservation has been created. Please complete your bank transfer using the details below.</p>${input.paymentQrUrl ? `<p><img src="${escapeHtml(input.paymentQrUrl)}" width="250" alt="Payment QR code" /></p>` : ''}<ul><li><strong>Order Number:</strong> ${escapeHtml(input.orderNumber)}</li><li><strong>Amount:</strong> ${input.amountCzk.toLocaleString('cs-CZ')} CZK</li><li><strong>Recipient:</strong> ${escapeHtml(input.accountName)}</li><li><strong>IBAN:</strong> ${escapeHtml(input.iban)}</li>${input.bic ? `<li><strong>BIC:</strong> ${escapeHtml(input.bic)}</li>` : ''}<li><strong>Variable Symbol:</strong> ${escapeHtml(input.variableSymbol)}</li><li><strong>Message/reference:</strong> ${escapeHtml(input.orderNumber)}</li></ul><p><a href="${escapeHtml(orderLookupUrl)}" style="display:inline-block;background:#008751;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">View My Order</a></p><p>Your tickets will be issued after finance confirms your payment.</p><p>You can later find your order at <a href="${escapeHtml(orderLookupUrl)}">owanbeineurope.cz/my-ticket</a>.</p></div>`;
}

export function ticketReadyHtml(input: {
  name: string;
  orderNumber: string;
  ticketCodes: string[];
  attendeeNames?: string[];
  ticketQrUrls?: Array<string | null | undefined>;
  ticketLinks?: string[];
}) {
  const tickets = input.ticketCodes.map((code, index) => {
    const ticketLink = input.ticketLinks?.[index] || `https://owanbeineurope.cz/my-ticket?ticket=${encodeURIComponent(code)}`;
    const attendeeName = input.attendeeNames?.[index] || input.name;
    const qrUrl = input.ticketQrUrls?.[index];
    return `<div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin:16px 0"><p><strong>Attendee:</strong> ${escapeHtml(attendeeName)}</p><p><strong>Ticket Code:</strong> ${escapeHtml(code)}</p>${qrUrl ? `<p><img src="${escapeHtml(qrUrl)}" width="250" alt="Ticket QR code" /></p>` : ''}<p><a href="${escapeHtml(ticketLink)}" style="display:inline-block;background:#008751;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Open Ticket</a></p></div>`;
  }).join('');
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h1>Your Owanbe in Europe ticket is ready</h1><p>Hello ${escapeHtml(input.name)},</p><p>Your payment has been confirmed and your ticket record is ready.</p><p><strong>Order:</strong> ${escapeHtml(input.orderNumber)}</p>${tickets}<p>Please bring your ticket code or QR code to check-in.</p></div>`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
