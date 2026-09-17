const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

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
