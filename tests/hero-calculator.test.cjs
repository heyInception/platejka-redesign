const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateTransfer,
  buildTransferMessage,
  buildTelegramUrl,
  commissionFor,
  formatMoney,
  formatRate,
  parseAmount,
} = require('../src/js/components/hero-calculator.cjs');

test('commission follows the production threshold', () => {
  assert.equal(commissionFor(2999), 275);
  assert.equal(commissionFor(3000), 15);
  assert.equal(commissionFor(100000), 500);
});

test('transfer exposes official, conversion, commission and total values', () => {
  assert.deepEqual(calculateTransfer(100000, 12.3), {
    officialRate: 12.3,
    conversionRate: 12.42,
    commission: 6211.5,
    base: 1242300,
    total: 1248511.5,
  });
});

test('invalid amounts and rates do not produce a result', () => {
  assert.equal(calculateTransfer(0, 12.3), null);
  assert.equal(calculateTransfer(-1, 12.3), null);
  assert.equal(calculateTransfer(100000, 0), null);
});

test('money and rates use Russian formatting', () => {
  assert.equal(formatMoney(1234.5).replace(/\u00a0/g, ' '), '1 234,5 ₽');
  assert.equal(formatRate(12.3).replace(/\u00a0/g, ' '), '12,3 ₽');
});

test('formatted amount from the transfer section is accepted without changing hero numbers', () => {
  assert.equal(parseAmount('100 000'), 100000);
  assert.equal(parseAmount('1 500,50'), 1500.5);
  assert.equal(parseAmount('abc'), NaN);
  assert.equal(calculateTransfer('100 000', 12.3)?.total, 1248511.5);
});

test('Telegram message includes the selected route and calculated result', () => {
  const message = buildTransferMessage({
    currency: 'CNY',
    amount: 100000,
    countryFrom: 'Россия',
    countryTo: 'Китай',
    result: calculateTransfer(100000, 12.3),
  });

  const readable = message.replace(/[\u00a0\u202f]/g, ' ');
  assert.match(readable, /Россия → Китай/);
  assert.match(readable, /100 000 CNY/);
  assert.match(readable, /6 211,5 ₽/);
  assert.match(readable, /1 248 511,5 ₽/);
});

test('Telegram URL encodes the message for the existing account', () => {
  const url = buildTelegramUrl('Россия → Китай\n100 000 CNY');
  assert.equal(url, 'https://t.me/platejka_com?text=%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F%20%E2%86%92%20%D0%9A%D0%B8%D1%82%D0%B0%D0%B9%0A100%20000%20CNY');
});
