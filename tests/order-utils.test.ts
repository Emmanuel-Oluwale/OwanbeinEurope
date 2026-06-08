import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { buildQrPlatbaPayload, pickPaymentAccount } from '../lib/orderUtils.ts';

const envKeys = [
  'PAYMENT_ACCOUNT_1_IBAN',
  'PAYMENT_ACCOUNT_1_NAME',
  'PAYMENT_ACCOUNT_1_BIC',
  'PAYMENT_ACCOUNT_2_IBAN',
  'PAYMENT_ACCOUNT_2_NAME',
  'PAYMENT_ACCOUNT_2_BIC'
];

afterEach(() => {
  for (const key of envKeys) {
    delete process.env[key];
  }
});

test('rotates payment handlers by name and reads BIC values', () => {
  process.env.PAYMENT_ACCOUNT_1_IBAN = 'CZ111';
  process.env.PAYMENT_ACCOUNT_1_NAME = 'Lola Account';
  process.env.PAYMENT_ACCOUNT_1_BIC = 'LOLAABC';
  process.env.PAYMENT_ACCOUNT_2_IBAN = 'CZ222';
  process.env.PAYMENT_ACCOUNT_2_NAME = 'Oyin Account';
  process.env.PAYMENT_ACCOUNT_2_BIC = 'OYINABC';

  assert.deepEqual(pickPaymentAccount(0), {
    label: 'Lola',
    name: 'Lola Account',
    iban: 'CZ111',
    bic: 'LOLAABC',
    isPlaceholder: false
  });
  assert.equal(pickPaymentAccount(1).label, 'Oyin');
  assert.equal(pickPaymentAccount(4).label, 'Lola');
});

test('builds QR Platba payload with recipient, IBAN, BIC, amount, variable symbol, and order reference', () => {
  const payload = buildQrPlatbaPayload({
    label: 'Lola',
    name: 'Lola Account',
    iban: 'CZ11 1111',
    bic: 'LOLAABC',
    isPlaceholder: false
  }, 2500, '202600123', 'OIE-2026-000123');

  assert.match(payload, /^SPD\*1\.0/);
  assert.match(payload, /ACC:CZ111111\+LOLAABC/);
  assert.match(payload, /AM:2500\.00/);
  assert.match(payload, /CC:CZK/);
  assert.match(payload, /X-VS:202600123/);
  assert.match(payload, /RN:Lola Account/);
  assert.match(payload, /MSG:Owanbe OIE-2026-000123/);
});

test('does not build QR payload for placeholder payment accounts', () => {
  assert.equal(buildQrPlatbaPayload({
    label: 'Lola',
    name: 'Lola',
    iban: 'PLACEHOLDER-IBAN-1',
    bic: 'PLACEHOLDER-BIC-1',
    isPlaceholder: true
  }, 1000, '202600001', 'OIE-2026-000001'), '');
});
