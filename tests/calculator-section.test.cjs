const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('reusable calculator section has labelled controls and result outputs', () => {
  const $ = cheerio.load(read('src/partials/calculator.html'));
  const section = $('section[data-transfer-calculator-section]');
  const form = section.find('form[data-transfer-calculator]');

  assert.equal(section.length, 1);
  assert.equal(section.find('.calculator__heading h2').length, 1);
  assert.equal(form.length, 1);
  assert.deepEqual(form.find('[data-currency]').map((_, el) => $(el).attr('data-currency')).get(), ['CNY', 'USD', 'EUR']);
  assert.equal(form.find('[data-currency-indicator]').length, 1);
  assert.equal(form.find('label:has(select[data-role="country-from"])').length, 1);
  assert.equal(form.find('label:has(select[data-role="country-to"])').length, 1);
  assert.equal(form.find('label:has(input[data-role="amount"])').length, 1);
  assert.equal(form.find('select[data-role="country-from"] option[value="RU"]').length, 1);
  assert.equal(form.find('select[data-role="country-to"] option[value="CN"]').length, 1);
  assert.ok(form.find('select[data-role="country-to"] option').length >= 50);
  assert.equal(section.find('[id]').length, 0);
  assert.equal(form.find('output[data-role="grand-total"]').length, 1);
  assert.equal(form.find('button[data-action="telegram"]').length, 1);
  assert.equal(form.find('button[data-action="request"]').length, 1);
  assert.equal(section.find('dialog[data-contact-dialog] [data-cf7-mount]').length, 1);
  assert.equal(JSON.parse(form.attr('data-currency-rates')).EUR, 90);
});

test('calculator section switches to stacked layout at tablet breakpoint', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;
  assert.match(css, /\.calculator\s*\{/);
  assert.match(css, /\.calculator__panel\s*\{/);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.calculator__columns\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});
