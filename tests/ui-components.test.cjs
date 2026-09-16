const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const sass = require('sass');

const root = path.resolve(__dirname, '..');

const compileSettings = () => sass.compile(
  path.join(root, 'src/scss/_settings.scss'),
  { style: 'expanded' },
).css;

test('UI controls expose the component variants from the Figma design system', () => {
  const css = compileSettings();

  for (const selector of [
    '.ui-button',
    '.ui-button--secondary',
    '.ui-button--overlay',
    '.ui-link',
    '.ui-link--brand',
    '.ui-tabs',
    '.ui-tab[aria-selected=true]',
    '.ui-select[aria-expanded=true]',
    '.ui-input[aria-invalid=true]',
    '.ui-amount-input',
  ]) {
    assert.ok(css.includes(selector), `compiled CSS must include ${selector}`);
  }
});

test('UI controls preserve accessible focus and disabled states', () => {
  const css = compileSettings();

  assert.match(css, /\.ui-button:focus-visible[^{]*\{[^}]*outline:\s*2px solid var\(--border-brand\)/s);
  assert.match(css, /\.ui-button:disabled[^{]*\{[^}]*cursor:\s*not-allowed/s);
  assert.match(css, /\.ui-input:focus[^{]*\{[^}]*border-color:\s*var\(--border-brand\)/s);
  assert.match(css, /\.ui-select:disabled[^{]*\{[^}]*color:\s*var\(--text-disabled\)/s);
});
