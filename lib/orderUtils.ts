export type PaymentAccount = {
  label: string;
  name: string;
  iban: string;
  bic: string;
  isPlaceholder: boolean;
};

const paymentHandlers = ['Lola', 'Oyin', 'Stephen', 'Akin'];

export function sanitizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeTicketCode(value: string) {
  return value.trim().toUpperCase();
}

export function buildSequence(count: number) {
  return count + 1;
}

export function buildOrderNumber(sequence: number, year = 2026) {
  const prefix = process.env.ORDER_PREFIX || 'OIE';
  return `${prefix}-${year}-${String(sequence).padStart(6, '0')}`;
}

export function buildVariableSymbol(sequence: number, year = 2026) {
  return `${year}${String(sequence).padStart(5, '0')}`;
}

export function pickPaymentAccount(orderCount: number): PaymentAccount {
  const index = (orderCount % 4) + 1;
  return buildPaymentAccount(index);
}

export function getPaymentAccountByLabel(label?: string | null): PaymentAccount | null {
  if (!label) return null;
  const index = paymentHandlers.findIndex((handler) => handler.toLowerCase() === label.toLowerCase()) + 1;
  if (!index) return null;
  return buildPaymentAccount(index);
}

function buildPaymentAccount(index: number): PaymentAccount {
  const iban = process.env[`PAYMENT_ACCOUNT_${index}_IBAN`];
  const name = process.env[`PAYMENT_ACCOUNT_${index}_NAME`];
  const bic = process.env[`PAYMENT_ACCOUNT_${index}_BIC`];
  const label = paymentHandlers[index - 1];

  return {
    label,
    name: name || label,
    iban: iban || `PLACEHOLDER-IBAN-${index}`,
    bic: bic || `PLACEHOLDER-BIC-${index}`,
    isPlaceholder: !iban || !name || !bic
  };
}

export function buildQrPlatbaPayload(account: PaymentAccount, amountCzk: number, variableSymbol: string, orderNumber: string) {
  if (account.isPlaceholder) {
    return '';
  }

  const iban = account.iban.replace(/\s+/g, '');
  const bic = account.bic.replace(/\s+/g, '');
  const recipient = encodeQrField(account.name);
  const message = encodeQrField(`Owanbe ${orderNumber}`);
  return `SPD*1.0*ACC:${iban}+${bic}*AM:${amountCzk.toFixed(2)}*CC:CZK*X-VS:${variableSymbol}*RN:${recipient}*MSG:${message}`;
}

function encodeQrField(value: string) {
  return value.replace(/\*/g, ' ').replace(/:/g, ' ').trim();
}

export function makeTicketCode(orderNumber: string, index: number) {
  const compactOrder = orderNumber.replace(/[^A-Z0-9]/gi, '');
  return `OIE-TICKET-${compactOrder}-${String(index + 1).padStart(2, '0')}`;
}
