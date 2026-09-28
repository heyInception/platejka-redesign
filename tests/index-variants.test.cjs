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

test('README documents independent ACF mode fields and safe values', () => {
  const readme = read('README.md');
  for (const field of ['shipments_mode', 'guarantees_mode', 'documents_mode']) {
    assert.match(readme, new RegExp(field));
  }
  assert.match(readme, /default.*main/s);
});
