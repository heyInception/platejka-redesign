const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const sass = require('sass');

const root = path.resolve(__dirname, '..');

test('main guarantees uses the selected Figma card spacing', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.guarantees--main \.guarantees__slider\s*\{[^}]*grid-template-rows:\s*214px 362px/s);
  assert.match(css, /\.guarantees--main \.guarantee-card--main-featured\s*\{[^}]*padding:\s*32px/s);
  assert.match(css, /\.guarantees--main \.guarantee-card--main-featured h3\s*\{[^}]*max-width:\s*100%/s);
  assert.match(css, /\.guarantees--main \.guarantee-card--main-featured p\s*\{[^}]*max-width:\s*100%/s);
  assert.match(css, /\.guarantees--main \.guarantee-card--main-secondary div\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column[^}]*justify-content:\s*space-between[^}]*height:\s*100%[^}]*max-width:\s*100%/s);
  assert.match(css, /\.guarantees--main \.guarantee-card--main-secondary h3\s*\{[^}]*font-size:\s*36px[^}]*line-height:\s*40px/s);
  assert.match(css, /\.guarantees--main \.guarantee-card--main-secondary p\s*\{[^}]*max-width:\s*321px/s);
});
