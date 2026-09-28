const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('comparison keeps semantic table relationships and an accessible scroll region', () => {
  const html = read('src/partials/table.html');

  assert.match(html, /<table/);
  assert.equal((html.match(/scope="col"/g) || []).length, 3);
  assert.equal((html.match(/scope="row"/g) || []).length, 5);
  assert.match(html, /tabindex="0"[^>]+role="region"[^>]+aria-label=/);
});

test('comparison uses the design assets instead of text-drawn logo and status icons', () => {
  const html = read('src/partials/table.html');

  assert.match(html, /src="\.\.\/img\/footerLogo\.svg"/);
  assert.match(html, /src="\.\.\/img\/table\/check\.png"/);
  assert.match(html, /src="\.\.\/img\/table\/danger\.png"/);
  assert.match(html, /src="\.\.\/img\/table\/close-square\.png"/);
  assert.doesNotMatch(html, /comparison__logo">P</);
});

test('comparison rows grow with their content at every breakpoint', () => {
  const scss = read('src/scss/components/_table.scss');

  assert.doesNotMatch(scss, /tbody\s+tr:nth-child\([^)]*\)[^{]*\{[^}]*height\s*:/s);
  assert.match(scss, /overflow-x:\s*auto/);
  assert.match(scss, /height:\s*auto/);
});

test('comparison desktop columns shrink without clipping between tablet and 1440px', () => {
  const scss = read('src/scss/components/_table.scss');

  assert.match(scss, /grid-template-columns:\s*277px minmax\(0, 328fr\) repeat\(2, minmax\(0, 319fr\)\)/);
  assert.match(scss, /width:\s*calc\(100% - 9px\)/);
});
