'use strict';

const numberFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
});

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function commissionFor(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return value >= 3000 ? value * 0.005 : 275;
}

function calculateTransfer(amount, rate) {
  const numericAmount = Number(amount);
  const officialRate = Number(rate);

  if (
    !Number.isFinite(numericAmount)
    || !Number.isFinite(officialRate)
    || numericAmount <= 0
    || officialRate <= 0
  ) {
    return null;
  }

  const conversionRate = roundMoney(officialRate * 1.01);
  const base = roundMoney(numericAmount * officialRate * 1.01);
  const commission = roundMoney(commissionFor(numericAmount) * officialRate * 1.01);

  return {
    officialRate,
    conversionRate,
    commission,
    base,
    total: roundMoney(base + commission),
  };
}

function formatMoney(value) {
  return `${numberFormatter.format(Number(value) || 0)} ₽`;
}

function formatRate(value) {
  return `${numberFormatter.format(Number(value) || 0)} ₽`;
}

module.exports = {
  calculateTransfer,
  commissionFor,
  formatMoney,
  formatRate,
  roundMoney,
};
