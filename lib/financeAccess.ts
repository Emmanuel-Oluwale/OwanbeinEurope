const defaultHandlerEmails: Record<string, string[]> = {
  Lola: ['omololairere@gmail.com'],
  Oyin: ['folarin_oyinkansola@yahoo.com'],
  Stephen: ['beephenstephen@gmail.com'],
  Akin: ['arogunseye@gmail.com']
};

function envEmailsForHandler(handler: string) {
  const raw = process.env[`FINANCE_HANDLER_${handler.toUpperCase()}_EMAILS`];
  if (!raw) return [];
  return raw.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export function getAssignedFinanceHandler(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  for (const handler of Object.keys(defaultHandlerEmails)) {
    const emails = [...defaultHandlerEmails[handler], ...envEmailsForHandler(handler)]
      .map((value) => value.trim().toLowerCase());

    if (emails.includes(normalizedEmail)) {
      return handler;
    }
  }

  return null;
}

export function canAccessFinanceOrder(input: { organizerEmail: string; organizerRole: string; orderHandler?: string | null }) {
  const assignedHandler = getAssignedFinanceHandler(input.organizerEmail);

  if (assignedHandler) {
    return input.orderHandler === assignedHandler;
  }

  return input.organizerRole === 'admin';
}
