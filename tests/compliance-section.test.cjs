const fs = require('node:fs'); const path = require('node:path'); const test = require('node:test'); const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'); const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
test('compliance section exposes semantic content and a CF7 placeholder dialog', () => {
  const html = read('src/partials/compliance.html');
  assert.match(html, /<section[^>]+data-compliance[^>]+aria-labelledby="compliance-title"/);
  assert.match(html, /<h2[^>]+id="compliance-title"/);
  assert.match(html, /data-compliance-dialog-open/); assert.match(html, /<dialog[^>]+data-compliance-dialog/); assert.match(html, /data-cf7-mount/);
  assert.equal((html.match(/bank-main-/g) || []).length, 7);
  assert.match(html, /<ul[^>]+compliance__banks/);
  for (const bank of ['Bank of China', 'ICBC', 'Emirates NBD', 'Bank Mandiri', 'China Construction Bank', 'Bank of Communications', 'Wise']) assert.match(html, new RegExp(bank));
});
test('compliance dialog is initialized from the component bundle', () => {
  assert.match(read('src/js/_components.js'), /components\/compliance/);
  const js = read('src/js/components/compliance.js');
  assert.match(js, /showModal\(\)/); assert.match(js, /dialogOpener/); assert.match(js, /event\.target === dialog/);
});
