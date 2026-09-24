# Index Main Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать в `index.html` утверждённые desktop- и tablet-варианты секций главной страницы по Figma, сохранив текущий вид `china.html` и подготовив три визуальных режима к будущему выбору через ACF.

**Architecture:** Gulp передаёт `mode: "main" | "default"` в единые partials `shipments`, `guarantees`, `documents`; неизвестное значение получает глобальный fallback `default`. Новые секции используют BEM и локальные `data-*`-контракты; `review-main`, `serves`, `cases` и tablet-версия `with-us` делят один GSAP-контроллер с чистой CommonJS-математикой.

**Tech Stack:** HTML partials via `gulp-file-include`, SCSS, vanilla JavaScript, GSAP 3, Node.js test runner, Sass, Figma Bridge.

**Spec:** `docs/superpowers/specs/2026-09-24-index-main-page-design.md`

## Global Constraints

- Источники Figma: `desktop` (`2206:4482`, 1440 px), `tablet` (`2347:2206`, 375 px), `Текстовая вкладка` (`2381:3343`), `Reviews` (`2381:3704`).
- Отдельного mobile-макета нет; вся адаптивная перестройка начинается с `@include tablet` (`max-width: 1024px`).
- Не менять визуально preloader, header, hero, about, work, calculator, seo, problems, faq, call и footer.
- `index.html` использует `main`; `china.html` использует `default` для `shipments`, `guarantees`, `documents`.
- Не добавлять WordPress/PHP, ACF-регистрацию или CF7; фиксировать только фронтенд-контракт и `data-cf7-mount`.
- Не перезаписывать существующие пользовательские изменения и ассеты; добавлять в коммиты только файлы текущей задачи.
- Все неизвестные контентные URL остаются `href="#"`.
- Интерактивные элементы доступны с клавиатуры и учитывают `prefers-reduced-motion`.

## Review Focus

- Пустой/неизвестный режим должен собраться как `default`; Task 1 закрепляет fallback и проверяет обе страницы.
- Одна карточка или viewport шире track не должны давать отрицательное смещение; Task 2 покрывает оба случая чистыми тестами.
- Resize на последнем слайде должен повторно ограничить индекс и смещение; Task 2 проверяет clamp и вызывает `refresh()`.
- Отсутствующий URL видео должен показать «Видео скоро появится», а ошибка загрузки — отдельное сообщение; Task 4 проверяет оба состояния.
- Отсутствующая необязательная стрелка или CTA не должны останавливать другие экземпляры; Tasks 2 и 3 используют optional selectors и тестируют публичный контракт.

Every newly created markup contract test starts with this prelude unless its task shows a more specific one:

```js
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
```

---

### Task 1: Build-time modes for shipments, guarantees, and documents

**Files:**
- Create: `tests/index-variants.test.cjs`
- Modify: `gulpfile.js:161-173`
- Modify: `src/index.html:11-15`
- Modify: `src/china.html:11-15`
- Modify: `src/partials/shipments.html`
- Modify: `src/partials/guarantees.html`
- Modify: `src/partials/documents.html`
- Modify: `src/scss/components/_shipments.scss`
- Modify: `src/scss/components/_guarantees.scss`
- Modify: `src/scss/components/_documents.scss`

**Interfaces:**
- Consumes: `gulp-file-include` with prefix `@`; existing `data-shipments`, `data-guarantees-slider`, `data-documents-slider` contracts.
- Produces: build context `mode: "main" | "default"`; BEM roots `--main`/`--default`; five main shipment cards; one featured plus two slider guarantee cards; compact main documents panel.

- [ ] **Step 1: Write the failing variant tests**

```js
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('index selects main variants and china preserves defaults', () => {
  const index = read('src/index.html');
  const china = read('src/china.html');
  for (const name of ['shipments', 'guarantees', 'documents']) {
    assert.match(index, new RegExp(`partials/${name}\\.html[^\\n]+"mode"\\s*:\\s*"main"`));
    assert.match(china, new RegExp(`partials/${name}\\.html[^\\n]+"mode"\\s*:\\s*"default"`));
  }
});

test('partials expose build-time main/default branches', () => {
  for (const name of ['shipments', 'guarantees', 'documents']) {
    const html = read(`src/partials/${name}.html`);
    assert.match(html, /@if \(mode === 'main'\)/);
    assert.match(html, /@if \(mode !== 'main'\)/);
    assert.match(html, new RegExp(`${name}--main`));
    assert.match(html, new RegExp(`${name}--default`));
  }
});

test('main variants contain the approved card counts', () => {
  assert.equal((read('src/partials/shipments.html').match(/shipment-card--main/g) || []).length, 5);
  assert.equal((read('src/partials/guarantees.html').match(/guarantee-card--main-secondary/g) || []).length, 2);
  assert.equal((read('src/partials/documents.html').match(/document-card--main/g) || []).length, 4);
});
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `node --test tests/index-variants.test.cjs`

Expected: FAIL because include contexts and conditional branches do not exist.

- [ ] **Step 3: Add build context and page include modes**

```js
.pipe(fileInclude({
  prefix: '@',
  basepath: '@file',
  context: { mode: 'default' },
}))
```

Use these exact include shapes in `index.html` and `china.html`:

```html
@include('partials/shipments.html', {"mode": "main"})
@include('partials/guarantees.html', {"mode": "main"})
@include('partials/documents.html', {"mode": "main"})
```

The China page uses the same three lines with `"default"`.

- [ ] **Step 4: Add conditional semantic markup for all six variants**

Use paired `@if (mode === 'main')` and `@if (mode !== 'main')` blocks. Preserve the current markup verbatim inside each default branch. Main roots must start exactly as follows:

```html
<section class="shipments shipments--main" data-shipments aria-labelledby="shipments-main-title">
  <div class="shipments__list" data-shipments-slider tabindex="0" role="region" aria-label="Направления международных платежей"></div>
</section>

<section class="guarantees guarantees--main" data-guarantees aria-labelledby="guarantees-main-title">
  <article class="guarantee-card guarantee-card--main-featured"></article>
  <div class="guarantees__slider" data-guarantees-slider tabindex="0" role="region" aria-label="Другие гарантии">
  </div>
</section>

<section class="documents documents--main" aria-labelledby="documents-main-title">
  <div class="documents__cards" data-documents-slider tabindex="0" role="region" aria-label="Документы для скачивания">
  </div>
</section>
```

Populate shipments with these five title/asset pairs: «Платежи в Китай»/`main-1.png`, «SWIFT переводы для бизнеса»/`main-2.png`, «Валютный контроль»/`main-3.png`, «Международные переводы для юридических лиц»/`main-4.png`, «Трансграничные платежи и переводы для юридических лиц»/`main-5.png`. Guarantees contains the featured title «Гарантируем поступление средств вашему контрагенту своими деньгами» plus secondary titles «Страхуем риски» and «Специалисты из финтеха». Documents contains «Официальный агентский контракт», «Образец SWIFT-подтверждения», «Образец поручения», «Образец отчёта агента». Copy the corresponding descriptions and tags verbatim from Figma nodes listed in Global Constraints; keep decorative imagery at `alt=""`.

- [ ] **Step 5: Add modifier-scoped desktop/tablet styles**

Keep existing declarations as the default baseline. Add only `.shipments--main`, `.guarantees--main`, `.documents--main` overrides. At desktop match nodes `2235:2979`, `2235:3474`, `2235:3630`; under `@include tablet` match `2347:2336`, `2347:2415`, `2347:2448`. Do not introduce `@include mobile`.

- [ ] **Step 6: Verify focused tests and both compiled pages**

Run: `node --test tests/index-variants.test.cjs tests/shipments.test.cjs tests/shipments-slider.test.cjs`

Run: `npm run build`

Expected: PASS; `app/index.html` contains `--main`, `app/china.html` contains `--default`, and no raw `@if` remains.

- [ ] **Step 7: Commit only the variant work**

```bash
git add gulpfile.js src/index.html src/china.html src/partials/shipments.html src/partials/guarantees.html src/partials/documents.html src/scss/components/_shipments.scss src/scss/components/_guarantees.scss src/scss/components/_documents.scss tests/index-variants.test.cjs
git commit -m "feat: add selectable main section variants"
```

### Task 2: Shared GSAP horizontal slider

**Files:**
- Create: `src/js/components/horizontal-slider.cjs`
- Create: `src/js/components/horizontal-slider.js`
- Create: `tests/horizontal-slider.test.cjs`
- Modify: `src/js/_components.js`

**Interfaces:**
- Consumes: roots `[data-horizontal-slider]` with viewport, track, slide, previous and next attributes.
- Produces: `clampIndex(index, count): number`, `getTargetOffset(offsets, index, viewportWidth, trackWidth): number`, `initHorizontalSlider(root): object|null`, and auto-initialization.

- [ ] **Step 1: Write failing pure-math tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { clampIndex, getTargetOffset } = require('../src/js/components/horizontal-slider.cjs');

test('clamps indexes including empty and single-card sliders', () => {
  assert.equal(clampIndex(-1, 3), 0);
  assert.equal(clampIndex(9, 3), 2);
  assert.equal(clampIndex(1, 1), 0);
  assert.equal(clampIndex(1, 0), 0);
});

test('targets measured slide offsets and clamps to track edge', () => {
  assert.equal(getTargetOffset([0, 448, 896], 1, 416, 1312), 448);
  assert.equal(getTargetOffset([0, 448, 896], 2, 600, 1312), 712);
  assert.equal(getTargetOffset([0], 0, 600, 280), 0);
});
```

- [ ] **Step 2: Run tests and confirm missing-module failure**

Run: `node --test tests/horizontal-slider.test.cjs`

Expected: FAIL with `MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement the pure functions**

```js
function clampIndex(index, count) {
  if (!Number.isFinite(index) || count < 2) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(index)));
}

function getTargetOffset(offsets, index, viewportWidth, trackWidth) {
  if (!offsets.length) return 0;
  const safeIndex = clampIndex(index, offsets.length);
  const origin = offsets[0] || 0;
  const maximum = Math.max(0, trackWidth - viewportWidth);
  return Math.min(maximum, Math.max(0, offsets[safeIndex] - origin));
}

module.exports = { clampIndex, getTargetOffset };
```

- [ ] **Step 4: Run pure tests and confirm PASS**

Run: `node --test tests/horizontal-slider.test.cjs`

- [ ] **Step 5: Implement the DOM controller with GSAP core**

`initHorizontalSlider(root)` must query local `data-horizontal-slider-*` nodes, return early for a missing viewport/track/slides, keep `currentIndex`, and expose `goTo(index)` plus `refresh()`. Measure `offsetLeft`, `clientWidth`, and `scrollWidth`; animate `track` with:

```js
gsap.to(track, {
  x: -getTargetOffset(offsets, currentIndex, viewport.clientWidth, track.scrollWidth),
  duration: reducedMotion.matches ? 0 : 0.45,
  ease: 'power3.out',
  overwrite: 'auto',
});
```

Add previous/next click, viewport keyboard arrows, pointer drag with `setPointerCapture`, `gsap.set(track, { x })`, nearest-slide snap on release, disabled synchronization, and a passive resize listener. Mark `root.dataset.horizontalSliderReady = 'true'` before binding.

- [ ] **Step 6: Import the controller and run the complete unit suite**

```js
import './components/horizontal-slider';
```

Run: `npm test`

Expected: all existing and new tests PASS.

- [ ] **Step 7: Commit the reusable controller**

```bash
git add src/js/components/horizontal-slider.cjs src/js/components/horizontal-slider.js src/js/_components.js tests/horizontal-slider.test.cjs
git commit -m "feat: add accessible GSAP card slider"
```

### Task 3: Financial compliance section and CF7 placeholder dialog

**Files:**
- Create: `tests/compliance-section.test.cjs`
- Modify: `src/partials/compliance.html`
- Modify: `src/scss/components/_compliance.scss`
- Create: `src/js/components/compliance.js`
- Modify: `src/js/_components.js`

**Interfaces:**
- Consumes: prepared images in `src/img/compliance/`.
- Produces: `[data-compliance]`, `[data-compliance-dialog-open]`, `[data-compliance-dialog]`, `[data-compliance-dialog-close]`, and `[data-cf7-mount]`.

- [ ] **Step 1: Write the failing structure/behavior contract test**

```js
test('compliance section exposes semantic content and a CF7 placeholder dialog', () => {
  const html = read('src/partials/compliance.html');
  assert.match(html, /<section[^>]+data-compliance[^>]+aria-labelledby="compliance-title"/);
  assert.match(html, /<h2[^>]+id="compliance-title"/);
  assert.match(html, /data-compliance-dialog-open/);
  assert.match(html, /<dialog[^>]+data-compliance-dialog/);
  assert.match(html, /data-cf7-mount/);
  assert.equal((html.match(/bank-main-/g) || []).length, 7);
});

test('compliance dialog is initialized from the component bundle', () => {
  assert.match(read('src/js/_components.js'), /components\/compliance/);
  const js = read('src/js/components/compliance.js');
  assert.match(js, /showModal\(\)/);
  assert.match(js, /dialogOpener/);
  assert.match(js, /event\.target === dialog/);
});
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `node --test tests/compliance-section.test.cjs`

- [ ] **Step 3: Build the semantic section and dialog**

Follow desktop node `2282:3727` and tablet node `2347:2483`. The CTA is a `<button type="button">`; the seven banks are a true list. The dialog contains title «Связаться с комплаенсом», explanatory copy «Форма будет подключена через Contact Form 7.» and an empty `<div data-cf7-mount></div>`.

- [ ] **Step 4: Implement local dialog behavior**

```js
function initCompliance(root) {
  if (root.dataset.complianceReady === 'true') return;
  const dialog = root.querySelector('[data-compliance-dialog]');
  const opener = root.querySelector('[data-compliance-dialog-open]');
  const closer = dialog?.querySelector('[data-compliance-dialog-close]');
  if (!dialog || !opener) return;
  root.dataset.complianceReady = 'true';
  opener.addEventListener('click', () => {
    dialog.dialogOpener = opener;
    dialog.showModal();
  });
  closer?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.dialogOpener?.focus?.());
}
document.querySelectorAll('[data-compliance]').forEach(initCompliance);
export { initCompliance };
```

- [ ] **Step 5: Style desktop/tablet and verify**

Match nodes exactly, keep dialog styles local to `.compliance-dialog`, then run:

Run: `node --test tests/compliance-section.test.cjs`

Run: `npx sass src/scss/main.scss NUL --no-source-map`

- [ ] **Step 6: Commit the section**

```bash
git add src/partials/compliance.html src/scss/components/_compliance.scss src/js/components/compliance.js src/js/_components.js tests/compliance-section.test.cjs
git commit -m "feat: add financial compliance section"
```

### Task 4: Review main with video and text tabs

**Files:**
- Create: `tests/review-main.test.cjs`
- Modify: `src/partials/review.html`
- Modify: `src/partials/review-main.html`
- Modify: `src/scss/components/_review-main.scss`
- Modify: `src/js/components/review.js`

**Interfaces:**
- Consumes: shared horizontal slider attributes from Task 2; existing video files/images; rating assets `2gis-main.png`, `yandex-main.png`, `yell-main.png`, `star-main.svg`.
- Produces: independent `[data-review]` roots with accessible tablists and local video dialogs.

- [ ] **Step 1: Write failing review contract tests**

```js
test('main review contains both accessible tab panels and slider controls', () => {
  const html = read('src/partials/review-main.html');
  assert.match(html, /<section[^>]+data-review/);
  assert.equal((html.match(/role="tab"/g) || []).length, 2);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 2);
  assert.match(html, /aria-selected="true"[^>]*>Видео-отзывы/);
  assert.equal((html.match(/review-main__text-card/g) || []).length, 3);
  assert.match(html, /data-horizontal-slider/);
  assert.match(html, /data-review-video/);
});

test('review behavior initializes every local root and preserves empty/error states', () => {
  const js = read('src/js/components/review.js');
  assert.match(js, /querySelectorAll\('\[data-review\]'\)/);
  assert.match(js, /Видео скоро появится/);
  assert.match(js, /review-video-error/);
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test tests/review-main.test.cjs`

- [ ] **Step 3: Add local data hooks to legacy review without changing its classes/content**

Add `data-review` to the root; add `data-review-tabs`, `data-review-video-panel`, `data-review-text-panel`, `data-review-dialog`, `data-review-close`, `data-review-loading`, `data-review-empty`, and `data-review-error`. Keep the old `.review` selectors for styling.

- [ ] **Step 4: Build review-main from all four named Figma states**

The main frames provide the initially active video state; additional frames provide text state. Include three rating cards, video cards, three text testimonials (Sasha Mekhel, Ева Джозеф, Вера Вера), slider arrows, and one local `<dialog>`. IDs must be unique to `review-main`.

- [ ] **Step 5: Refactor review.js to initialize per root**

Wrap all existing logic in `initReview(root)`, replace the global `.review` query with `document.querySelectorAll('[data-review]').forEach(initReview)`, and resolve tabs, panels, dialog, loading and errors from `root`. Keep the existing lazy `video.src` assignment, click-to-pause, backdrop close, focus restoration and ARIA keyboard navigation. Remove the old slider math from review and let Task 2 initialize the review track.

- [ ] **Step 6: Style both desktop and tablet tab states and verify**

Match `2235:3544`/`2381:3343` on desktop and `2347:2509`/`2381:3704` under `@include tablet`.

Run: `node --test tests/review-main.test.cjs`

Run: `npm test`

- [ ] **Step 7: Commit review work**

```bash
git add src/partials/review.html src/partials/review-main.html src/scss/components/_review-main.scss src/js/components/review.js tests/review-main.test.cjs
git commit -m "feat: add main review tabs and cards"
```

### Task 5: With-us and destinations sections

**Files:**
- Create: `tests/index-content-sections.test.cjs`
- Modify: `src/partials/with-us.html`
- Modify: `src/scss/components/_with-us.scss`
- Modify: `src/partials/destinations.html`
- Modify: `src/scss/components/_destinations.scss`

**Interfaces:**
- Consumes: Task 2 slider contract for tablet `with-us`; prepared images in `src/img/with-us/` and `src/img/destinations/`.
- Produces: six with-us articles and static destinations card with 45 flag assets and globe.

- [ ] **Step 1: Write failing structural tests**

```js
test('with-us has six cards and tablet slider hooks', () => {
  const html = read('src/partials/with-us.html');
  assert.equal((html.match(/<article/g) || []).length, 6);
  assert.equal((html.match(/main-item-/g) || []).length, 6);
  assert.match(html, /data-horizontal-slider/);
});

test('destinations exposes copy, globe and all prepared flags', () => {
  const html = read('src/partials/destinations.html');
  assert.match(html, /aria-labelledby="destinations-title"/);
  assert.match(html, /globe-main\.png/);
  assert.equal((html.match(/flags-/g) || []).length, 45);
  assert.match(html, /href="#"[^>]*>Смотреть все страны/);
});
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `node --test tests/index-content-sections.test.cjs`

- [ ] **Step 3: Implement semantic markup and image intent**

Use six `<article>` elements for with-us. Use a plain decorative container for the globe/flags; every flag and globe image has `alt=""`, while country names stay as text. Add slider controls only if shown in the named Figma frame; the tablet track must still expose keyboard focus.

- [ ] **Step 4: Implement desktop/tablet SCSS**

Match `2259:2257` and `2235:4384`; under tablet match `2347:2591` and `2347:3766`. With-us is a 2-column desktop grid and 280 px tablet track. Destinations remains one card.

- [ ] **Step 5: Verify and commit**

Run: `node --test tests/index-content-sections.test.cjs`

Run: `npx sass src/scss/main.scss NUL --no-source-map`

```bash
git add src/partials/with-us.html src/scss/components/_with-us.scss src/partials/destinations.html src/scss/components/_destinations.scss tests/index-content-sections.test.cjs
git commit -m "feat: add benefits and destinations sections"
```

### Task 6: Serves and cases sliders

**Files:**
- Create: `tests/index-slider-sections.test.cjs`
- Modify: `src/partials/serves.html`
- Modify: `src/scss/components/_serves.scss`
- Modify: `src/partials/cases.html`
- Modify: `src/scss/components/_cases.scss`

**Interfaces:**
- Consumes: complete Task 2 slider contract; prepared serves icons and case logos.
- Produces: seven industry slides, three case slides, working desktop/tablet navigation.

- [ ] **Step 1: Write failing markup/CSS tests**

```js
test('serves and cases expose exact card counts and shared slider hooks', () => {
  const serves = read('src/partials/serves.html');
  const cases = read('src/partials/cases.html');
  assert.equal((serves.match(/data-horizontal-slider-slide/g) || []).length, 7);
  assert.equal((cases.match(/data-horizontal-slider-slide/g) || []).length, 3);
  for (const html of [serves, cases]) {
    assert.match(html, /data-horizontal-slider-prev/);
    assert.match(html, /data-horizontal-slider-next/);
  }
});

test('serves viewport escapes the right side of the content grid', () => {
  const scss = read('src/scss/components/_serves.scss');
  assert.match(scss, /calc\(100vw\s*-\s*max\(/);
});
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `node --test tests/index-slider-sections.test.cjs`

- [ ] **Step 3: Build semantic cards and controls**

Use `section > header + viewport > track > article`. Controls are `<button type="button">` with «Предыдущая карточка»/«Следующая карточка» labels. Serves copy/assets follow `2235:4601`; cases copy/assets follow `2235:4713`.

- [ ] **Step 4: Implement breakout and tablet layouts**

Anchor `.serves__viewport` at the container’s left edge and use:

```scss
width: calc(100vw - max(var(--container-offset), (100vw - var(--content-width)) / 2));
overflow: hidden;
```

Match desktop nodes `2235:4601`, `2235:4713`; under tablet match `2349:4207`, `2349:4300`. Preserve partially visible next cards.

- [ ] **Step 5: Verify slider sections and commit**

Run: `node --test tests/index-slider-sections.test.cjs tests/horizontal-slider.test.cjs`

Run: `npm run build`

```bash
git add src/partials/serves.html src/scss/components/_serves.scss src/partials/cases.html src/scss/components/_cases.scss tests/index-slider-sections.test.cjs
git commit -m "feat: add industry and case sliders"
```

### Task 7: Semantic comparison table

**Files:**
- Create: `tests/comparison-table.test.cjs`
- Modify: `src/partials/table.html`
- Modify: `src/scss/components/_table.scss`

**Interfaces:**
- Consumes: `check.png`, `close-square.png`, `danger.png`.
- Produces: one accessible `<table>` with one row-header column and three comparison columns inside a tablet-scrollable region.

- [ ] **Step 1: Write the failing semantic test**

```js
test('comparison is a semantic table with scoped headers', () => {
  const html = read('src/partials/table.html');
  assert.match(html, /<table/);
  assert.equal((html.match(/scope="col"/g) || []).length, 3);
  assert.equal((html.match(/scope="row"/g) || []).length, 5);
  assert.match(html, /tabindex="0"[^>]+role="region"[^>]+aria-label=/);
});
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `node --test tests/comparison-table.test.cjs`

- [ ] **Step 3: Implement the exact table content**

Use caption/heading «Почему работа с нами — ваш лучший выбор», row labels «Модель цены», «Скорость платежей», «Риски», «Удобство работы», «Документооборот», and three scoped company columns from Figma node `2235:5363`. Images are decorative supplements to textual status labels, never the only accessible content.

- [ ] **Step 4: Add desktop/tablet styles**

Match `2235:5363`; under tablet match `2350:4662`. Keep the native table at `min-width: 880px` inside an overflow-x wrapper instead of converting it to div cards.

- [ ] **Step 5: Verify and commit**

Run: `node --test tests/comparison-table.test.cjs`

Run: `npx sass src/scss/main.scss NUL --no-source-map`

```bash
git add src/partials/table.html src/scss/components/_table.scss tests/comparison-table.test.cjs
git commit -m "feat: add semantic service comparison table"
```

### Task 8: Integration, ACF handoff, and visual verification

**Files:**
- Modify: `README.md`
- Modify only if missing imports/includes are detected: `src/index.html`, `src/scss/main.scss`, `src/js/_components.js`
- Test: all `tests/*.test.cjs`

**Interfaces:**
- Consumes: all earlier tasks.
- Produces: complete `app/index.html`, regression-safe `app/china.html`, documented ACF handoff.

- [ ] **Step 1: Add a failing documentation/integration assertion**

Extend `tests/index-variants.test.cjs`:

```js
test('README documents independent ACF mode fields and safe values', () => {
  const readme = read('README.md');
  for (const field of ['shipments_mode', 'guarantees_mode', 'documents_mode']) {
    assert.match(readme, new RegExp(field));
  }
  assert.match(readme, /default.*main/s);
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test tests/index-variants.test.cjs`

- [ ] **Step 3: Document the WordPress/ACF handoff**

Add a README section naming the three independent Select fields, accepted values `default`/`main`, fallback `default`, and the requirement to preserve all `data-*` attributes when translating the partials to PHP. State that compliance uses `data-cf7-mount`.

- [ ] **Step 4: Run automated verification**

Run: `npm test`

Expected: all tests PASS.

Run: `npm run build`

Expected: exit 0; no raw `@include`/`@if` remains in `app/index.html` or `app/china.html`.

Run: `npm run html`

Expected: validator exits 0. If the external validator is unavailable, record that limitation and still run a local markup scan with `rg -n "@include|@if" app/index.html app/china.html`.

- [ ] **Step 5: Perform visual and interaction QA**

Open `app/index.html` at 1440 px and 375 px, plus a boundary check at 1024 px. Compare against the named Figma frames, checking section heights, 64/16/8 px gutters, type sizes, radii, prepared images, visible next-slide crops, and the serves right-side breakout. Exercise every arrow, keyboard arrows, pointer drag, both review tabs, video dialog, compliance dialog, reduced motion, and horizontal table scroll.

Open `app/china.html` at 1440 px and 375 px and verify that shipments, guarantees and documents retain the default visuals and behavior.

- [ ] **Step 6: Inspect the final diff for unrelated changes**

Run: `git status --short`

Run: `git diff --check`

Run: `git diff --stat`

Expected: only planned source/test/docs files plus pre-existing user changes; no generated `app/` files are committed unless they were already tracked and intentionally part of the repository workflow.

- [ ] **Step 7: Commit the integration/documentation changes**

```bash
git add README.md tests/index-variants.test.cjs src/index.html src/scss/main.scss src/js/_components.js
git commit -m "docs: document main page ACF modes"
```

- [ ] **Step 8: Request final code review**

Review the complete branch against `docs/superpowers/specs/2026-09-24-index-main-page-design.md`, with special attention to the five Review Focus cases and preservation of pre-existing user changes.
