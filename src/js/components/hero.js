import { gsap } from 'gsap';

const {
  buildTelegramUrl,
  buildTransferMessage,
  calculateTransfer,
  formatMoney,
  formatRate,
  parseAmount,
} = require('./hero-calculator.cjs');
const { getHeroImageOffset } = require('./hero-motion.cjs');

const currencySymbols = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
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

function animateCurrencyIndicator(root, activeButton, immediate = false) {
  const indicator = root.querySelector('[data-currency-indicator]');
  const firstButton = root.querySelector('[data-currency]');
  if (!indicator || !firstButton || !activeButton) return;

  const x = activeButton.offsetLeft - firstButton.offsetLeft;
  if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(indicator, { x, scaleX: 1 });
    return;
  }

  gsap.timeline({ defaults: { overwrite: 'auto' } })
    .to(indicator, {
      x,
      scaleX: 1.08,
      transformOrigin: x > Number(gsap.getProperty(indicator, 'x')) ? 'right center' : 'left center',
      duration: 0.42,
      ease: 'power3.inOut',
    })
    .to(indicator, {
      scaleX: 1,
      duration: 0.18,
      ease: 'power2.out',
    }, '-=0.08');
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
  const cf7Summary = dialog.querySelector('[data-cf7-summary]');
  if (cf7Summary) cf7Summary.value = summary || '';
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
  const countryFrom = root.querySelector('[data-role="country-from"]');
  const countryTo = root.querySelector('[data-role="country-to"]');
  const countryFlag = root.querySelector('[data-role="country-flag"]');
  const telegramButton = root.querySelector('[data-action="telegram"]');
  const isTransfer = root.hasAttribute('data-transfer-calculator');
  let currency = buttons.find((button) => button.classList.contains('is-active'))?.dataset.currency;
  let currentResult = null;

  if (!currency || !rates[currency]) currency = Object.keys(rates)[0] || '';

  const calculate = () => {
    currentResult = calculateTransfer(input?.value, rates[currency]);
    writeResult(root, currentResult);
    if (symbol) symbol.textContent = currencySymbols[currency] || currency;

    if (currentResult) {
      root.dispatchEvent(new CustomEvent(isTransfer ? 'calculator:calculated' : 'hero:calculated', {
        bubbles: true,
        detail: {
          amount: parseAmount(input.value),
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
      animateCurrencyIndicator(root, button);
      calculate();
    });
  });

  input?.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    calculate();
  });

  countryTo?.addEventListener('change', () => {
    if (!countryFlag) return;
    const flag = countryTo.selectedOptions[0]?.dataset.flag;
    countryFlag.hidden = !flag;
    countryFlag.parentElement.classList.toggle('has-no-flag', !flag);
    if (flag) countryFlag.src = flag;
  });

  const summary = (result) => {
    if (!isTransfer) return buildSummary(parseAmount(input.value), currency, result);
    return buildTransferMessage({
      currency,
      amount: parseAmount(input.value),
      countryFrom: countryFrom?.selectedOptions[0]?.textContent?.trim() || 'Россия',
      countryTo: countryTo?.selectedOptions[0]?.textContent?.trim() || '',
      result,
    });
  };

  const validResult = () => {
    const result = calculate();
    if (!result) {
      input?.setAttribute('aria-invalid', 'true');
      input?.focus();
    }
    return result;
  };

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = validResult();
    if (result) openContactDialog(dialog, summary(result), event.submitter);
  });

  telegramButton?.addEventListener('click', () => {
    const result = validResult();
    if (result) window.open(buildTelegramUrl(summary(result)), '_blank', 'noopener');
  });

  const activeButton = buttons.find((button) => button.dataset.currency === currency);
  setCurrency(buttons, activeButton);
  animateCurrencyIndicator(root, activeButton, true);
  window.addEventListener('resize', () => {
    const selectedButton = buttons.find((button) => button.getAttribute('aria-pressed') === 'true');
    animateCurrencyIndicator(root, selectedButton, true);
  });
  calculate();
}

function initHeroMotion(root) {
  if (!root || root.dataset.motionReady === 'true') return;
  root.dataset.motionReady = 'true';

  const panel = root.querySelector('[data-hero-panel]');
  const image = root.querySelector('[data-hero-image]');
  const blur = root.querySelector('[data-hero-blur]');
  const copyTargets = root.querySelectorAll('[data-hero-copy]');
  const calculator = root.querySelector('[data-hero-calculator]');
  const cards = root.querySelectorAll('[data-hero-cards] > *');
  const media = gsap.matchMedia();
  let hasPlayed = false;

  const play = () => {
    if (hasPlayed) return;
    hasPlayed = true;

    media.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        desktop: '(min-width: 1025px) and (pointer: fine)',
      },
      (context) => {
        const { reduceMotion, desktop } = context.conditions;
        const targets = [panel, image, blur, ...copyTargets, calculator, ...cards].filter(Boolean);

        if (reduceMotion) {
          gsap.set(targets, { clearProps: 'all' });
          return undefined;
        }

        const intro = gsap.timeline({
          defaults: { ease: 'power3.out' },
        });

        intro
          .from(panel, {
            clipPath: 'inset(0 100% 0 0 round 32px)',
            duration: desktop ? 0.9 : 0.65,
          })
          .from(image, {
            autoAlpha: 0,
            scale: 1.12,
            xPercent: 8,
            duration: 1.1,
          }, 0.08)
          .from(blur, {
            autoAlpha: 0,
            scale: 1.16,
            yPercent: 16,
            duration: 1,
          }, 0.12)
          .from(copyTargets, {
            autoAlpha: 0,
            y: 24,
            stagger: desktop ? 0.08 : 0.055,
            duration: 0.55,
          }, 0.28)
          .from([calculator, ...cards], {
            autoAlpha: 0,
            y: 32,
            stagger: 0.1,
            duration: 0.65,
          }, 0.42);

        const ambient = gsap.to(blur, {
          scale: 1.045,
          yPercent: -2,
          duration: 5.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          paused: true,
        });
        intro.eventCallback('onComplete', () => ambient.play());

        let handlePointerMove;
        let handlePointerLeave;
        if (desktop && image) {
          const moveX = gsap.quickTo(image, 'x', { duration: 0.7, ease: 'power3.out' });
          const moveY = gsap.quickTo(image, 'y', { duration: 0.7, ease: 'power3.out' });

          handlePointerMove = (event) => {
            const bounds = panel.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            moveX(getHeroImageOffset(x));
            moveY(y * 12);
          };
          handlePointerLeave = () => {
            moveX(0);
            moveY(0);
          };
          panel.addEventListener('pointermove', handlePointerMove);
          panel.addEventListener('pointerleave', handlePointerLeave);
        }

        return () => {
          if (handlePointerMove) panel.removeEventListener('pointermove', handlePointerMove);
          if (handlePointerLeave) panel.removeEventListener('pointerleave', handlePointerLeave);
          intro.kill();
          ambient.kill();
          gsap.killTweensOf([image, blur]);
        };
      },
      root,
    );
  };

  if (document.documentElement.dataset.pageReady === 'true' || !document.querySelector('[data-preloader]')) {
    play();
  } else {
    document.addEventListener('platejka:ready', play, { once: true });
  }
}

const hero = document.querySelector('[data-hero]');
const dialog = hero?.querySelector('[data-contact-dialog]');

document.querySelectorAll('[data-hero-calculator], [data-transfer-calculator]').forEach((calculator) => {
  const section = calculator.closest('[data-hero], [data-transfer-calculator-section]');
  const localDialog = section?.querySelector('[data-contact-dialog]');
  initContactDialog(localDialog);
  initHeroCalculator(calculator, localDialog);
});

if (hero) {
  initHeroMotion(hero);

  document.querySelectorAll('[data-graph-path="call"]').forEach((button) => {
    button.addEventListener('click', () => openContactDialog(dialog, '', button));
  });
}

export {
  buildSummary,
  initContactDialog,
  initHeroCalculator,
  initHeroMotion,
  openContactDialog,
  parseRates,
};
