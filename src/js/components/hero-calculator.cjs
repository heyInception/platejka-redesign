'use strict';

const numberFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
});

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function commissionFor(amount) {
  const value = parseAmount(amount);

  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return value >= 3000 ? value * 0.005 : 275;
}

function parseAmount(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  const normalized = value.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  return /^\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}

function calculateTransfer(amount, rate) {
  const numericAmount = parseAmount(amount);
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

function buildTransferMessage({ currency, amount, countryFrom, countryTo, result }) {
  return [
    `Валюта платежа: ${currency}`,
    `Маршрут: ${countryFrom} → ${countryTo}`,
    `Сумма: ${numberFormatter.format(parseAmount(amount))} ${currency}`,
    `Комиссия агента: ${formatMoney(result.commission)}`,
    `Итого в рублях: ${formatMoney(result.total)}`,
  ].join('\n');
}

function buildTelegramUrl(message) {
  return `https://t.me/platejka_com?text=${encodeURIComponent(message)}`;
}

module.exports = {
  buildTelegramUrl,
  buildTransferMessage,
  calculateTransfer,
  commissionFor,
  formatMoney,
  formatRate,
  parseAmount,
  roundMoney,
};
