const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const sass = require('sass');

const root = path.resolve(__dirname, '..');

test('china documents keeps its full-width Figma layout independently from documents-main', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;
  const background = path.join(root, 'src/img/documents/background.png');

  assert.match(css, /\.documents--default\s*\{[^}]*padding:\s*40px 0 0/s);
  assert.match(css, /\.documents--default \.documents__panel\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*background:[^;}]*url\("\.\.\/img\/documents\/background\.png"\)/s);
  assert.match(css, /\.documents--default \.documents__title\s*\{[^}]*margin-bottom:\s*24px/s);
  assert.match(css, /\.documents--default \.documents__intro\s*\{[^}]*margin-bottom:\s*40px/s);
  assert.match(css, /\.documents--default \.documents__cards\s*\{[^}]*grid-column:\s*1[^}]*grid-row:\s*auto/s);
  assert.equal(fs.existsSync(background), true);
  assert.ok(fs.statSync(background).size > 0);
});
