const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateTransfer,
  commissionFor,
  formatMoney,
  formatRate,
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
