export type PaymentAccount = {
  label: string;
  name: string;
  iban: string;
};

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
  const iban = process.env[`PAYMENT_ACCOUNT_${index}_IBAN`];
  const name = process.env[`PAYMENT_ACCOUNT_${index}_NAME`];

  if (!iban || !name) {
    throw new Error(`Missing PAYMENT_ACCOUNT_${index}_IBAN or PAYMENT_ACCOUNT_${index}_NAME.`);
  }

  return {
    label: `account_${index}`,
    name,
    iban
  };
}

export function makeTicketCode(orderNumber: string, index: number) {
  const compactOrder = orderNumber.replace(/[^A-Z0-9]/gi, '');
  return `OIE-TICKET-${compactOrder}-${String(index + 1).padStart(2, '0')}`;
}
