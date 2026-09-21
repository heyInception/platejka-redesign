const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('shipments partial exposes a semantic six-card section without links', () => {
  const html = read('src/partials/shipments.html');

  assert.match(html, /<section[^>]+data-shipments/);
  assert.match(html, /<h2\b[^>]*>От обычного инвойса до сложных поставок<\/h2>/);
  assert.equal((html.match(/<article\b/g) || []).length, 6);
  assert.equal((html.match(/data-shipments-image/g) || []).length, 6);
  assert.doesNotMatch(html, /<a\b|<button\b/);
});

test('shipments is included in the page and initialized as a component', () => {
  const page = read('src/index.html');
  const imports = read('src/js/_components.js');
  const js = read('src/js/components/shipments.js');

  assert.match(page, /@include\(['"]partials\/shipments\.html['"]\)/);
  assert.match(imports, /import ['"]\.\/components\/shipments['"]/);
  assert.match(js, /ScrollTrigger/);
  assert.match(js, /once:\s*true/);
  assert.match(js, /prefers-reduced-motion:\s*reduce/);
  assert.match(js, /pointerdown/);
  assert.match(js, /scrollLeft/);
});

test('shipments styles compile to the desktop grid and tablet slider', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.shipments__list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.shipment-card\s*\{[^}]*height:\s*340px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*\.shipments__list\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*\.shipment-card\s*\{[^}]*width:\s*280px[^}]*height:\s*390px/s);
});
