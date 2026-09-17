const {
  calculateTransfer,
  formatMoney,
  formatRate,
} = require('./hero-calculator.cjs');

const currencySymbols = {
  CNY: '¥',
  USD: '$',
};

function parseRates(root) {
  try {
    const rates = JSON.parse(root.getAttribute('data-currency-rates') || '{}');
    return rates && typeof rates === 'object' ? rates : {};
  } catch (error) {
    return {};
  }
}

function setCurrency(buttons, activeButton) {
  buttons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function writeResult(root, result) {
  const values = {
    'official-rate': formatRate(result?.officialRate),
    'conversion-rate': formatRate(result?.conversionRate),
    commission: formatMoney(result?.commission),
    'grand-total': formatMoney(result?.total),
  };

  Object.entries(values).forEach(([role, value]) => {
    const output = root.querySelector(`[data-role="${role}"]`);
    if (output) output.textContent = value;
  });
}

function buildSummary(amount, currency, result) {
  return [
    `Валюта платежа: ${currency}`,
    `Сумма: ${new Intl.NumberFormat('ru-RU').format(amount)} ${currency}`,
    `Комиссия агента: ${formatMoney(result.commission)}`,
    `Итого в рублях: ${formatMoney(result.total)}`,
  ].join('\n');
}

function openContactDialog(dialog, summary, opener) {
  if (!dialog || dialog.open) return;

  const summaryElement = dialog.querySelector('[data-dialog-summary]');
  if (summaryElement) summaryElement.textContent = summary || 'Расчёт не выбран.';
  dialog.dialogOpener = opener || document.activeElement;
  dialog.showModal();
}

function initContactDialog(dialog) {
  if (!dialog || dialog.dataset.dialogReady === 'true') return;
  dialog.dataset.dialogReady = 'true';

  dialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialog.dialogOpener?.focus?.();
    dialog.dialogOpener = null;
  });
}

function initHeroCalculator(root, dialog) {
  if (!root || root.dataset.calculatorReady === 'true') return;
  root.dataset.calculatorReady = 'true';

  const rates = parseRates(root);
  const buttons = [...root.querySelectorAll('[data-currency]')];
  const input = root.querySelector('[data-role="amount"]');
  const symbol = root.querySelector('[data-role="currency-symbol"]');
  let currency = buttons.find((button) => button.classList.contains('is-active'))?.dataset.currency;
  let currentResult = null;

  if (!currency || !rates[currency]) currency = Object.keys(rates)[0] || '';

  const calculate = () => {
    currentResult = calculateTransfer(input?.value, rates[currency]);
    writeResult(root, currentResult);
    if (symbol) symbol.textContent = currencySymbols[currency] || currency;

    if (currentResult) {
      root.dispatchEvent(new CustomEvent('hero:calculated', {
        bubbles: true,
        detail: {
          amount: Number(input.value),
          currency,
          ...currentResult,
        },
      }));
    }

    return currentResult;
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!rates[button.dataset.currency]) return;
      currency = button.dataset.currency;
      setCurrency(buttons, button);
      calculate();
    });
  });

  input?.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    calculate();
  });

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = calculate();

    if (!result) {
      input?.setAttribute('aria-invalid', 'true');
      input?.focus();
      return;
    }

    openContactDialog(dialog, buildSummary(Number(input.value), currency, result), event.submitter);
  });

  setCurrency(buttons, buttons.find((button) => button.dataset.currency === currency));
  calculate();
}

const hero = document.querySelector('[data-hero]');
const dialog = document.querySelector('[data-contact-dialog]');

if (hero) {
  initContactDialog(dialog);
  initHeroCalculator(hero.querySelector('[data-hero-calculator]'), dialog);

  document.querySelectorAll('[data-graph-path="call"]').forEach((button) => {
    button.addEventListener('click', () => openContactDialog(dialog, '', button));
  });
}

export {
  buildSummary,
  initContactDialog,
  initHeroCalculator,
  openContactDialog,
  parseRates,
};
