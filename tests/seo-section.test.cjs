const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const sass = require('sass');
const { initSeoSections } = require('../src/js/components/seo.cjs');

const root = path.resolve(__dirname, '..');
const $ = cheerio.load(fs.readFileSync(path.join(root, 'src/partials/seo.html'), 'utf8'));

test('SEO content is semantic and readable without JavaScript', () => {
  const section = $('section[data-seo-section]');

  assert.equal(section.length, 1);
  assert.equal(section.find('h2').first().text().trim(), 'Платежи в Китай');
  assert.equal(section.find('button[data-seo-toggle][hidden]').length, 1);
  assert.equal(section.find('[data-seo-content]:not([hidden])').length, 1);
  assert.equal(section.find('.seo__mobile-extra').length, 1);
  assert.equal(section.find('.seo__card').length, 6);
  assert.equal(section.find('[id]').length, 0);
  assert.match(section.text(), /сейчас, в 2026 году\./);
  assert.match(section.text(), /Почему прямые переводы в Китай не работают/);
  assert.match(section.text(), /Контроль комплаенса/);
  assert.equal(section.find('.seo__risk-list > li').length, 3);
});

function makeSeoFixture({ complete = true } = {}) {
  const attributes = new Map();
  const classes = new Set();
  let clickListener;
  const button = {
    hidden: true,
    textContent: '',
    setAttribute: (name, value) => attributes.set(name, value),
    getAttribute: (name) => attributes.get(name),
    addEventListener: (name, listener) => {
      if (name === 'click') clickListener = listener;
    },
  };
  const content = { hidden: false };
  const root = {
    querySelector: (selector) => {
      if (selector === '[data-seo-toggle]') return button;
      return complete ? content : null;
    },
    classList: {
      toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
      contains: (name) => classes.has(name),
    },
  };

  return { root, button, content, click: () => clickListener() };
}

test('reveal is accessible and scoped to each SEO section', () => {
  const first = makeSeoFixture();
  const second = makeSeoFixture();
  const incomplete = makeSeoFixture({ complete: false });
  const doc = { querySelectorAll: () => [first.root, second.root, incomplete.root] };

  assert.equal(initSeoSections(doc), 2);
  assert.equal(first.content.hidden, true);
  assert.equal(first.button.hidden, false);
  assert.equal(first.button.textContent, 'Показать ещё');
  assert.equal(first.button.getAttribute('aria-expanded'), 'false');

  first.click();
  assert.equal(first.content.hidden, false);
  assert.equal(first.button.textContent, 'Скрыть');
  assert.equal(first.button.getAttribute('aria-expanded'), 'true');
  assert.equal(second.content.hidden, true);

  first.click();
  assert.equal(first.content.hidden, true);
  assert.equal(first.root.classList.contains('is-collapsed'), true);
});

test('SEO styles provide desktop cards and tablet stacking', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.seo__cards\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.seo \[hidden\]\s*\{[^}]*display:\s*none/);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.seo__cards\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.seo\.is-collapsed \.seo__mobile-extra\s*\{[^}]*display:\s*none/);
});
