# Hero Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Завершить адаптивный Hero по двум Figma-макетам, подключить проверенную формулу калькулятора, доступный диалог и синхронизированную GSAP-анимацию.

**Architecture:** Семантический HTML хранит только контент и `data-*` контракт. Чистые расчётные функции живут в CommonJS-модуле для прямого запуска Node-тестами, а browser-компонент импортирует их, управляет DOM, dialog и GSAP. SCSS использует существующие токены и брейкпоинты; WordPress позже подставит ACF-данные без изменения JS.

**Tech Stack:** Gulp 4, HTML partials, SCSS/BEM, vanilla JavaScript, GSAP 3.15, Node.js test runner, Sass.

**Spec:** `docs/superpowers/specs/2026-09-17-hero-calculator-design.md`

## Global Constraints

- Изменять только `C:\project\platejka-new`; WordPress-тема остаётся read-only источником поведения.
- Desktop соответствует Figma node `2070:1298`, mobile — `4045:4004`.
- Формула: до 3000 комиссия 275 единиц валюты, от 3000 — 0,5%; курс конвертации содержит коэффициент 1,01.
- Начальное состояние: CNY, сумма 100000; доступны CNY и USD.
- Основное и blur-изображения поступают через inline `--hero-image` и `--hero-blur`.
- Один `h1`, две безопасные текстовые части; form, label, output и native dialog обязательны.
- GSAP intro ждёт `platejka:ready`; reduced motion показывает финальное состояние без анимации.
- Не добавлять новые runtime-зависимости.

## File Map

- `src/js/components/hero-calculator.cjs` — чистая формула, округление и форматирование.
- `src/js/components/hero.js` — DOM-контроллер калькулятора, dialog и GSAP lifecycle.
- `src/partials/hero.html` — единая desktop/mobile разметка Hero.
- `src/scss/components/_hero.scss` — Hero, калькулятор, карточки и dialog.
- `src/js/components/preloader.js` — единое событие готовности страницы.
- `src/js/_components.js` — импорт Hero-компонента.
- `tests/hero-calculator.test.cjs` — юнит-тесты бизнес-формулы.
- `tests/hero.test.cjs` — HTML/JS/SCSS контрактные тесты.

---

### Task 1: Чистая модель расчёта

**Files:**
- Create: `src/js/components/hero-calculator.cjs`
- Create: `tests/hero-calculator.test.cjs`

**Interfaces:**
- Consumes: `{ amount: number|string, rate: number|string }`.
- Produces: `commissionFor(amount): number`, `roundMoney(value): number`, `calculateTransfer(amount, rate): { officialRate, conversionRate, commission, base, total } | null`, `formatMoney(value): string`, `formatRate(value): string`.

- [ ] **Step 1: Write the failing formula tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const calculator = require('../src/js/components/hero-calculator.cjs');

test('commission follows the production threshold', () => {
  assert.equal(calculator.commissionFor(2999), 275);
  assert.equal(calculator.commissionFor(3000), 15);
  assert.equal(calculator.commissionFor(100000), 500);
});

test('transfer exposes official, conversion, commission and total values', () => {
  assert.deepEqual(calculator.calculateTransfer(100000, 12.3), {
    officialRate: 12.3,
    conversionRate: 12.42,
    commission: 6211.5,
    base: 1242300,
    total: 1248511.5,
  });
});

test('invalid amounts and rates do not produce a result', () => {
  assert.equal(calculator.calculateTransfer(0, 12.3), null);
  assert.equal(calculator.calculateTransfer(-1, 12.3), null);
  assert.equal(calculator.calculateTransfer(100000, 0), null);
});

test('money and rates use Russian formatting', () => {
  assert.equal(calculator.formatMoney(1234.5).replace(/\u00a0/g, ' '), '1 234,5 ₽');
  assert.equal(calculator.formatRate(12.3).replace(/\u00a0/g, ' '), '12,3 ₽');
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/hero-calculator.test.cjs`

Expected: FAIL with `Cannot find module '../src/js/components/hero-calculator.cjs'`.

- [ ] **Step 3: Implement the minimal calculation module**

```js
'use strict';

const numberFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

function commissionFor(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value >= 3000 ? value * 0.005 : 275;
}

function calculateTransfer(amount, rate) {
  const numericAmount = Number(amount);
  const officialRate = Number(rate);
  if (!Number.isFinite(numericAmount) || !Number.isFinite(officialRate)
    || numericAmount <= 0 || officialRate <= 0) return null;

  const conversionRate = roundMoney(officialRate * 1.01);
  const base = roundMoney(numericAmount * officialRate * 1.01);
  const commission = roundMoney(commissionFor(numericAmount) * officialRate * 1.01);
  return { officialRate, conversionRate, commission, base, total: roundMoney(base + commission) };
}

const formatMoney = (value) => `${numberFormatter.format(Number(value) || 0)} ₽`;
const formatRate = (value) => `${numberFormatter.format(Number(value) || 0)} ₽`;

module.exports = { calculateTransfer, commissionFor, formatMoney, formatRate, roundMoney };
```

- [ ] **Step 4: Run the focused and full suites**

Run: `node --test tests/hero-calculator.test.cjs`

Expected: 4 tests PASS.

Run: `npm test`

Expected: all existing and new tests PASS.

- [ ] **Step 5: Commit the model**

```bash
git add src/js/components/hero-calculator.cjs tests/hero-calculator.test.cjs
git commit -m "feat: add hero calculator model"
```

---

### Task 2: Семантическая Hero-разметка

**Files:**
- Modify: `src/partials/hero.html`
- Create: `tests/hero.test.cjs`

**Interfaces:**
- Consumes: `data-currency-rates='{"CNY":12.3,"USD":81.0929}'`, `--hero-image`, `--hero-blur`.
- Produces: selectors `[data-hero]`, `[data-hero-calculator]`, `[data-currency]`, `[data-role]`, `[data-contact-dialog]` for Task 3.

- [ ] **Step 1: Write failing semantic contract tests**

```js
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const read = (file) => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');

test('hero exposes semantic calculator and reusable content contract', () => {
  const html = read('src/partials/hero.html');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /hero__title-primary/);
  assert.match(html, /hero__title-secondary/);
  assert.match(html, /--hero-image:/);
  assert.match(html, /--hero-blur:/);
  assert.match(html, /<form[^>]+data-hero-calculator/);
  assert.match(html, /data-currency-rates='\{"CNY":[^']+"USD":[^']+\}'/);
  assert.match(html, /<label[^>]+for="hero-amount"/);
  assert.match(html, /<input[^>]+id="hero-amount"[^>]+value="100000"/);
  assert.match(html, /<output[^>]+data-role="grand-total"/);
  assert.match(html, /<dialog[^>]+data-contact-dialog/);
});
```

- [ ] **Step 2: Run the contract test and verify RED**

Run: `node --test tests/hero.test.cjs`

Expected: FAIL on missing semantic calculator markers and dialog.

- [ ] **Step 3: Replace the partial with the approved structure**

Implement one `.hero__layout` containing:

```html
<section class="hero" data-hero>
  <div class="container">
    <div class="hero__layout">
      <div class="hero__content">
        <div class="hero__wrap hero__wrap_top"
          style="--hero-image: url('../img/china-hero-bg.png'); --hero-blur: url('../img/china-hero-blur.png')">
          <p class="hero__badge">Юридическим лицам</p>
          <h1 class="hero__title">
            <span class="hero__title-primary">Платежи в Китай</span>
            <span class="hero__title-secondary">для юридических лиц по агентскому договору</span>
          </h1>
          <!-- description, metric list, supporting note -->
        </div>
        <!-- three trust cards -->
      </div>

      <form class="hero-calculator" data-hero-calculator
        data-currency-rates='{"CNY":12.3,"USD":81.0929}' novalidate>
        <!-- registry banner, CNY/USD buttons with aria-pressed, labeled amount input,
             four output rows, submit CTA and contract note -->
      </form>
    </div>
  </div>
  <dialog class="contact-dialog" data-contact-dialog aria-labelledby="contact-dialog-title">
    <!-- close button, title, explanation and data-dialog-summary -->
  </dialog>
</section>
```

Use `<ul>` for the three metric facts and three trust facts because membership/order as a grouped list is meaningful. Use `<button type="button">` for currencies and dialog close; use `<button type="submit">` for the calculator CTA. Preserve existing trust-card links as `<a>` on desktop and do not duplicate markup for mobile.

- [ ] **Step 4: Run contract tests**

Run: `node --test tests/hero.test.cjs`

Expected: semantic contract PASS.

Run: `npm test`

Expected: full suite PASS.

- [ ] **Step 5: Commit the markup**

```bash
git add src/partials/hero.html tests/hero.test.cjs
git commit -m "feat: add semantic hero calculator markup"
```

---

### Task 3: DOM-контроллер и доступный dialog

**Files:**
- Create: `src/js/components/hero.js`
- Modify: `src/js/_components.js`
- Modify: `tests/hero.test.cjs`

**Interfaces:**
- Consumes: calculation exports from Task 1 and selectors from Task 2.
- Produces: `initHeroCalculator(root)`, live outputs, `hero:calculated` detail, native dialog behavior.

- [ ] **Step 1: Extend the JS contract test**

```js
test('hero component binds calculator, dialog and ACF-friendly data attributes', () => {
  const js = read('src/js/components/hero.js');
  const imports = read('src/js/_components.js');
  assert.match(imports, /import ['"]\.\/components\/hero['"]/);
  assert.match(js, /require\(['"]\.\/hero-calculator\.cjs['"]\)/);
  assert.match(js, /data-currency-rates/);
  assert.match(js, /aria-pressed/);
  assert.match(js, /showModal\(\)/);
  assert.match(js, /data-dialog-summary/);
  assert.match(js, /hero:calculated/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/hero.test.cjs`

Expected: FAIL because `src/js/components/hero.js` does not exist.

- [ ] **Step 3: Implement calculator and dialog controllers**

Implement these focused functions in `hero.js`:

```js
const { calculateTransfer, formatMoney, formatRate } = require('./hero-calculator.cjs');

function parseRates(root) { /* JSON.parse with empty-object fallback */ }
function setCurrency(buttons, active) { /* is-active + aria-pressed */ }
function writeResult(root, result) { /* official, conversion, commission, grand total */ }
function buildSummary(amount, currency, result) { /* Russian readable lines */ }
function openContactDialog(dialog, summary, opener) { /* textContent + showModal */ }
function initHeroCalculator(root) { /* initial CNY, input/click/submit listeners */ }
function initContactDialog(dialog) { /* close button + backdrop click + focus restore */ }
```

On every valid calculation dispatch:

```js
root.dispatchEvent(new CustomEvent('hero:calculated', {
  bubbles: true,
  detail: { amount, currency, ...result },
}));
```

On invalid submit set `aria-invalid="true"`, focus the amount, and do not open dialog. All `[data-graph-path="call"]` buttons open the same dialog; when no calculator summary exists, show the generic text.

- [ ] **Step 4: Run tests and build the JavaScript bundle**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: webpack completes without module or syntax errors.

- [ ] **Step 5: Commit the interaction layer**

```bash
git add src/js/components/hero.js src/js/_components.js tests/hero.test.cjs
git commit -m "feat: connect hero calculator and dialog"
```

---

### Task 4: Pixel-faithful responsive styling

**Files:**
- Modify: `src/scss/components/_hero.scss`
- Modify: `tests/hero.test.cjs`

**Interfaces:**
- Consumes: Task 2 class names and existing CSS tokens/mixins.
- Produces: 1440 desktop layout, 375 mobile layout, intermediate tablet stacking, dialog visuals.

- [ ] **Step 1: Add failing responsive style assertions**

```js
const sass = require('sass');

test('hero styles compile desktop, mobile, dialog and reduced-motion states', () => {
  const css = sass.compile(path.resolve(__dirname, '../src/scss/main.scss')).css;
  assert.match(css, /\.hero__layout\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*864px\)\s*416px/);
  assert.match(css, /\.hero__title-secondary\s*\{[^}]*var\(--text-overlay-secondary\)/s);
  assert.match(css, /\.hero-calculator/);
  assert.match(css, /\.contact-dialog::backdrop/);
  assert.match(css, /@media \(max-width:\s*576px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
```

- [ ] **Step 2: Run the style test and verify RED**

Run: `node --test tests/hero.test.cjs`

Expected: FAIL on missing grid, calculator, dialog and mobile rules.

- [ ] **Step 3: Implement desktop styles from Figma**

Use the exact major geometry:

- container content width 1312px, outer vertical padding 40px/64px;
- grid columns `minmax(0, 864px) 416px`, gap 32px;
- red panel 540px high, radius 32px, padding 40px, gap 20px;
- trust cards: three equal columns, 172px high, gap 24px;
- calculator shell 744px high, radius 24px, padding 16px;
- inner calculator radius 16px, padding 24px;
- amount input 88px; CTA 60px;
- use `var(--hero-image)` and `var(--hero-blur)` on separate absolutely positioned pseudo/child layers with `pointer-events: none`.

- [ ] **Step 4: Implement tablet/mobile and dialog styles**

At `@include tablet`, stack content and calculator with fluid widths. At `@include mobile`, match 375px Figma geometry:

- section inset 8px;
- red panel min-height 408px, radius 16px, padding 16px;
- title 32/32, description 14/20;
- metrics remain one row with 4px gaps and compact padding;
- calculator outer width 100%, inner padding 16px, CTA 48px;
- registry banner follows the calculator body;
- trust cards form three 117px-equivalent fluid columns, 132px high;
- dialog width `min(100% - 32px, 480px)`.

Add visible focus styles and a `prefers-reduced-motion` block removing transition/animation. Do not hide keyboard focus.

- [ ] **Step 5: Run tests and compile production styles**

Run: `node --test tests/hero.test.cjs`

Expected: PASS.

Run: `npm run build`

Expected: Sass, autoprefixer and minification complete without errors.

- [ ] **Step 6: Commit the responsive presentation**

```bash
git add src/scss/components/_hero.scss tests/hero.test.cjs
git commit -m "feat: style responsive hero and calculator"
```

---

### Task 5: GSAP intro, ambient motion and preloader handoff

**Files:**
- Modify: `src/js/components/hero.js`
- Modify: `src/js/components/preloader.js`
- Modify: `tests/hero.test.cjs`
- Modify: `tests/header.test.cjs`

**Interfaces:**
- Consumes: `platejka:ready`, `[data-hero-motion]` targets, GSAP.
- Produces: intro timeline, desktop pointer parallax, ambient tween and cleanup.

- [ ] **Step 1: Write failing animation contract tests**

```js
test('hero waits for page readiness and honors reduced motion', () => {
  const hero = read('src/js/components/hero.js');
  const preloader = read('src/js/components/preloader.js');
  assert.match(hero, /from ['"]gsap['"]/);
  assert.match(hero, /gsap\.matchMedia\(\)/);
  assert.match(hero, /platejka:ready/);
  assert.match(hero, /prefers-reduced-motion: reduce/);
  assert.match(hero, /clipPath/);
  assert.match(hero, /pointermove/);
  assert.match(preloader, /platejka:ready/);
});
```

Update the header readiness assertion to expect the shared `platejka:ready` event instead of `platejka:preloader-complete`.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/hero.test.cjs tests/header.test.cjs`

Expected: FAIL on missing shared readiness event and Hero animation markers.

- [ ] **Step 3: Unify the readiness event**

In `preloader.js`, dispatch exactly once after visibility is restored:

```js
document.dispatchEvent(new CustomEvent('platejka:ready'));
```

Update `header.js` only if required by the test/actual listener so Header and Hero use the same event. Preserve immediate fallback when `[data-preloader]` is absent by having each component start on DOM readiness if the preloader element does not exist.

- [ ] **Step 4: Implement scoped Hero motion**

Use `gsap.context()` and `gsap.matchMedia()`:

```js
const media = gsap.matchMedia();
media.add({
  reduce: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 1025px) and (pointer: fine)',
}, ({ conditions }) => {
  if (conditions.reduce) {
    gsap.set(targets, { clearProps: 'all' });
    return undefined;
  }
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro.from(panel, { clipPath: 'inset(0 100% 0 0 round 32px)', duration: 0.9 })
    .from(copyTargets, { autoAlpha: 0, y: 24, stagger: 0.08, duration: 0.55 }, '-=0.5')
    .from([calculator, ...cards], { autoAlpha: 0, y: 32, stagger: 0.1, duration: 0.65 }, '-=0.4');
  // ambient yPercent/scale tween; pointermove quickTo only when desktop
  return () => { /* remove pointer listener; kill tweens */ };
});
```

Store readiness on `document.documentElement.dataset.pageReady = 'true'` so a component imported after the event still starts. Ensure animation never leaves content hidden when JS errors or reduced motion is active.

- [ ] **Step 5: Run focused and full verification**

Run: `node --test tests/hero.test.cjs tests/header.test.cjs`

Expected: PASS.

Run: `npm test`

Expected: all tests PASS.

Run: `npm run build`

Expected: production build PASS.

- [ ] **Step 6: Commit motion integration**

```bash
git add src/js/components/hero.js src/js/components/preloader.js src/js/components/header.js tests/hero.test.cjs tests/header.test.cjs
git commit -m "feat: animate hero after page readiness"
```

---

### Task 6: Visual and accessibility verification

**Files:**
- Modify as required by verified defects only: `src/partials/hero.html`, `src/scss/components/_hero.scss`, `src/js/components/hero.js`
- Modify: `README.md`

**Interfaces:**
- Consumes: completed Hero.
- Produces: verified desktop/mobile behavior and concise maintenance documentation.

- [ ] **Step 1: Build and run all automated checks**

Run:

```bash
npm test
npm run build
npm run html
```

Expected: tests and build PASS; HTML validator reports no Hero/dialog errors. If the external validator is unavailable, record that fact and validate the generated `app/china.html` locally for unique IDs and label/control pairs.

- [ ] **Step 2: Start the local preview**

Run: `npm run dev`

Expected: BrowserSync serves the project and `china.html` loads without console errors.

- [ ] **Step 3: Compare desktop and mobile**

Verify at 1440×900 against node `2070:1298` and at 375×812 against node `4045:4004`:

- order and geometry;
- typography, spacing, radii and colors;
- CNY/USD switching and 100000 initial result;
- registry banner moves below calculator on mobile;
- trust cards remain a single compact row;
- no horizontal overflow at 320, 375, 768, 1024 and 1440 widths.

- [ ] **Step 4: Verify accessibility and motion manually**

Keyboard-check currency buttons, amount input, CTA, dialog close and Escape. Confirm focus returns to the opener. Emulate `prefers-reduced-motion: reduce` and confirm all content is immediately visible. Confirm pointer parallax runs only with `(pointer: fine)` and does not move interactive controls.

- [ ] **Step 5: Document the WordPress/ACF handoff**

Add a README section listing:

- `data-currency-rates` JSON shape;
- `--hero-image` and `--hero-blur` inline variables;
- `title_primary` / `title_secondary` mapping;
- the proposed ACF field list from the spec;
- `platejka:ready` lifecycle event.

- [ ] **Step 6: Re-run checks and commit verified polish**

Run: `npm test && npm run build`

Expected: PASS.

```bash
git add src/partials/hero.html src/scss/components/_hero.scss src/js/components/hero.js README.md
git commit -m "docs: document hero WordPress contract"
```
