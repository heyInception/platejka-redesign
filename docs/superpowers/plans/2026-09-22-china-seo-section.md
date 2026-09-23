# China SEO Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reusable, expandable SEO section already included on `china.html`, matching the three supplied Penpot frames.

**Architecture:** Keep page-specific copy in `src/partials/seo.html`, component styling in `src/scss/components/_seo.scss`, and instance-scoped reveal behavior in a small JS component. Content is visible in the raw HTML; JS progressively enhances it into the collapsed state, so a failed or disabled script never hides copy.

**Tech Stack:** HTML partials via Gulp file-include, SCSS with the existing `@include tablet`, vanilla JavaScript, Node `node:test` and Cheerio.

**Spec:** `docs/superpowers/specs/2026-09-22-china-seo-section-design.md`

## Global Constraints

- Scope is only the SEO section; do not change the calculator or other components.
- Copy and claims must be transferred verbatim from Penpot, without editorial or factual changes.
- Use `seo-short` (`a9c56746-e4bc-8050-8008-adac853edf11`), `seo-mobile` (`a9c56746-e4bc-8050-8008-adaca8194f6f`), and expanded `SEO` (`d727da47-cf5a-53b1-b04b-07fd408feb3e`) on page `79ec7bdd-95d6-80ff-8008-ac34ef05a2af`.
- Mobile rules start at `@include tablet` (max-width: 1024px); the mobile collapsed teaser ends after «сейчас, в 2026 году.».
- Expanded mobile contains the same text and six cards as expanded desktop, with one-column cards.
- Preserve all pre-existing uncommitted work; stage only files changed for this task.

## File Map

- `src/partials/seo.html`: semantic, page-specific copy and component hooks; currently empty but already included by `src/china.html`.
- `src/js/components/seo.cjs`: pure DOM initializer `initSeoSections(doc)`; works with any number of sections.
- `src/js/components/seo.js`: browser entry that calls `initSeoSections(document)`.
- `src/js/_components.js`: import the browser entry.
- `src/scss/components/_seo.scss`: visual implementation; already imported by `src/scss/main.scss`.
- `tests/seo-section.test.cjs`: structural and behavior tests.

## Review Focus

1. JavaScript unavailable: all copy and cards remain visible and no inert toggle is shown; test raw HTML state in Task 1.
2. Multiple section instances: toggling one does not change another; test in Task 2.
3. Keyboard activation: native button semantics and `aria-expanded` update on click; test structure in Task 1 and behavior in Task 2.
4. Mobile teaser boundary: collapsed preview stops at the exact Penpot sentence but expansion restores the rest; test markup split in Task 1 and class/visibility state in Task 2.
5. Width at 375/1024 px: cards form one column without horizontal overflow; test compiled CSS in Task 3 and inspect rendered page.

---

### Task 1: Semantic content and exact Penpot copy

**Files:**
- Modify: `src/partials/seo.html`
- Create: `tests/seo-section.test.cjs`

**Interfaces:**
- Produces: `[data-seo-section]`, `[data-seo-toggle]`, `[data-seo-content]`, and `.seo__mobile-extra` for Tasks 2–3.
- Raw HTML presents the entire section; enhancement will hide expanded content and mobile-only extra copy.

- [ ] **Step 1: Retrieve copy from Penpot.** Use `mcp__penpot__execute_code` on the expanded board with:

```js
const board = penpotUtils.findShapeById('d727da47-cf5a-53b1-b04b-07fd408feb3e');
return penpotUtils.findShapes(shape => shape.type === 'text', board)
  .map(shape => ({ name: shape.name, text: shape.characters, x: shape.x, y: shape.y }))
  .sort((a, b) => a.y - b.y || a.x - b.x);
```

Cross-check all paragraphs and the six cards against `mcp__penpot__export_shape` for that board. For the teaser split, use the exact sentence after «сейчас, в 2026 году.» in the intro.

- [ ] **Step 2: Write failing structure tests.** In `tests/seo-section.test.cjs`, use `node:test`, `assert/strict`, and Cheerio. Test one `section[data-seo-section]`, an `h2`, a native `button[data-seo-toggle]` initially `hidden`, one `[data-seo-content]` initially visible, a `.seo__mobile-extra` after the mobile sentence, six numbered cards, and the headings shown in the expanded board. Explicitly assert that there are no IDs on the section so multiple copies can coexist.

```js
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync(path.resolve(__dirname, '../src/partials/seo.html'), 'utf8'));
test('SEO is readable without JavaScript', () => {
  const root = $('section[data-seo-section]');
  assert.equal(root.length, 1);
  assert.equal(root.find('h2').first().text().trim(), 'Платежи в Китай');
  assert.equal(root.find('button[data-seo-toggle][hidden]').length, 1);
  assert.equal(root.find('[data-seo-content]:not([hidden])').length, 1);
  assert.equal(root.find('[id]').length, 0);
  assert.equal(root.find('.seo__card').length, 6);
  assert.match(root.text(), /сейчас, в 2026 году\./);
});
```

- [ ] **Step 3: Run `node --test tests/seo-section.test.cjs`.** Expect a failure because the partial is empty.
- [ ] **Step 4: Implement the markup.** Use one `<section class="seo" data-seo-section>` inside `.container`; a heading and intro paragraph; wrap the mobile teaser remainder in `.seo__mobile-extra`; use `<button type="button" data-seo-toggle hidden aria-expanded="false">` after the intro; put subsequent sections and six numbered `<article class="seo__card">` elements in `[data-seo-content]`. The expanded prose and list items must come from the Penpot extraction, not be rewritten. Use `h3` for subsection headings and an ordered list only where content is truly a list. Keep the toggle before expanded content in DOM order; style it to match each state.
- [ ] **Step 5: Run `node --test tests/seo-section.test.cjs`.** Expect pass.
- [ ] **Step 6: Commit only `src/partials/seo.html` and `tests/seo-section.test.cjs`** with message `feat: add China SEO content` (do not stage unrelated dirty files).

### Task 2: Progressive, instance-scoped reveal

**Files:**
- Create: `src/js/components/seo.cjs`
- Create: `src/js/components/seo.js`
- Modify: `src/js/_components.js`
- Modify: `tests/seo-section.test.cjs`

**Interfaces:**
- Consumes: `[data-seo-section]`, `[data-seo-toggle]`, `[data-seo-content]`, `.seo__mobile-extra` from Task 1.
- Produces: `initSeoSections(doc)`; returns the count of enhanced sections. Per-section `.is-collapsed` class and `button[aria-expanded]` encode state.

- [ ] **Step 1: Write failing initializer tests.** Use small fake DOM objects with `querySelectorAll`, `querySelector`, `classList`, `hidden`, `textContent`, `setAttribute`, and a stored click listener. Assert initialization hides each content block, reveals each toggle, sets «Показать ещё»/`false`; clicking one toggles only its own section to visible/«Скрыть»/`true`, and a second click restores the collapsed state. Assert an incomplete section is skipped and count excludes it.

```js
const { initSeoSections } = require('../src/js/components/seo.cjs');
function makeSeoFixture() {
  const attributes = new Map();
  const classes = new Set();
  const button = {
    hidden: true,
    textContent: '',
    setAttribute: (name, value) => attributes.set(name, value),
    getAttribute: (name) => attributes.get(name),
    addEventListener: (name, listener) => { if (name === 'click') button.click = listener; },
  };
  const content = { hidden: false };
  const root = {
    querySelector: (selector) => selector === '[data-seo-toggle]' ? button : content,
    classList: { toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name) },
  };
  return { root, button, content, click: () => button.click() };
}
test('reveal is scoped to each section', () => {
  const first = makeSeoFixture();
  const second = makeSeoFixture();
  assert.equal(initSeoSections({ querySelectorAll: () => [first.root, second.root] }), 2);
  first.click();
  assert.equal(first.content.hidden, false);
  assert.equal(first.button.getAttribute('aria-expanded'), 'true');
  assert.equal(second.content.hidden, true);
  first.click();
  assert.equal(first.content.hidden, true);
});
```

- [ ] **Step 2: Run `node --test tests/seo-section.test.cjs`.** Expect module-not-found failure.
- [ ] **Step 3: Implement the initializer and browser entry.** `initSeoSections(doc)` loops over `doc.querySelectorAll('[data-seo-section]')`; for each complete section set `content.hidden = true`, `button.hidden = false`, add `.is-collapsed`, and update text/`aria-expanded`. The click listener derives next state from `content.hidden`; no global selectors inside it. `seo.js` requires the CJS initializer and passes `document`; `_components.js` imports `./components/seo`.

```js
function initSeoSections(doc) {
  let count = 0;
  doc.querySelectorAll('[data-seo-section]').forEach((root) => {
    const button = root.querySelector('[data-seo-toggle]');
    const content = root.querySelector('[data-seo-content]');
    if (!button || !content) return;
    const render = (collapsed) => {
      content.hidden = collapsed;
      root.classList.toggle('is-collapsed', collapsed);
      button.setAttribute('aria-expanded', String(!collapsed));
      button.textContent = collapsed ? 'Показать ещё' : 'Скрыть';
    };
    render(true);
    button.hidden = false;
    button.addEventListener('click', () => render(!content.hidden));
    count += 1;
  });
  return count;
}
module.exports = { initSeoSections };
```

- [ ] **Step 4: Run `node --test tests/seo-section.test.cjs` and `npm test`.** Expect pass; if unrelated pre-existing tests fail, record that separately without modifying unrelated components.
- [ ] **Step 5: Commit only Task 2 files** with message `feat: add accessible SEO expansion`.

### Task 3: Responsive Penpot styling and verification

**Files:**
- Modify: `src/scss/components/_seo.scss`
- Modify: `tests/seo-section.test.cjs`

**Interfaces:**
- Consumes: `.seo`, `.seo__mobile-extra`, `.seo__card`, `.is-collapsed` and the `hidden` attribute.
- Produces: 1440 px desktop and 375 px mobile layouts, with breakpoint at 1024 px.

- [ ] **Step 1: Add failing compiled-CSS assertions.** Compile `src/scss/main.scss` using `sass.compile` and assert `.seo` selectors exist, `@media (max-width: 1024px)` contains one-column card rules, and `[hidden]` remains `display:none` even when display styles are applied to the toggle/content. Check `.seo.is-collapsed .seo__mobile-extra` is hidden only under tablet rules.

```js
const sass = require('sass');
test('SEO stacks at tablet breakpoint', () => {
  const css = sass.compile(path.resolve(__dirname, '../src/scss/main.scss')).css;
  assert.match(css, /\.seo__cards\s*\{[^}]*grid-template-columns:\s*repeat\(3/);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.seo__cards\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /\.seo \[hidden\]\s*\{[^}]*display:\s*none/);
});
```

- [ ] **Step 2: Run `node --test tests/seo-section.test.cjs`.** Expect CSS assertions to fail while `_seo.scss` is empty.
- [ ] **Step 3: Implement SCSS.** Use the exported Penpot boards for exact values. Desktop outer frame: 1440 px, 64 px horizontal inset, `h2` 48 px/56 px, intro 16 px/24 px, 24 px vertical content gaps, three equal card columns with 32 px gaps. Mobile board: 375 px, 8 px horizontal inset, `h2` 30 px/34 px, intro 14 px/20 px, 24 px content gaps; cards one column. Use existing design tokens from `src/scss/_vars.scss`; keep `[hidden] { display: none; }` inside `.seo`, and hide `.seo__mobile-extra` only for `.is-collapsed` under `@include tablet`.
- [ ] **Step 4: Run `node --test tests/seo-section.test.cjs`, `npm test`, and `npm run build`.** Expect pass and a successful build. Run the local preview, compare 1440 px collapsed, 375 px collapsed, 1440 px expanded with Penpot exports, and inspect 375 px expanded for overflow. Adjust only SEO styles until matching.
- [ ] **Step 5: Commit only `src/scss/components/_seo.scss` and Task 3 test changes** with message `style: match China SEO Penpot layouts`.

## Final verification

Re-run `npm test` and `npm run build`; review `git diff` for unintended changes. Do not stage or overwrite the existing user-owned calculator, hero, review, or page changes. Report any visual deviation or unavailable Penpot state explicitly.
