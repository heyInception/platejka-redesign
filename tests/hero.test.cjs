const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const sass = require('sass');

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
  assert.match(html, /<input[^>]+id="hero-amount"[^>]+min="1"[^>]+step="1"[^>]+inputmode="numeric"[^>]+value="100000"/s);
  assert.match(html, /<output[^>]+data-role="grand-total"/);
  assert.match(html, /src="\.\.\/img\/cn-flag\.png"/);
  assert.match(html, /src="\.\.\/img\/usa-flag\.png"/);
  assert.match(html, /data-currency-indicator/);
  assert.match(html, /src="\.\.\/img\/Shield-Check\.svg"/);
  assert.match(html, /src="\.\.\/img\/hero__trust-years-left\.svg"/);
  assert.match(html, /src="\.\.\/img\/hero__trust-years-right\.svg"/);
  assert.doesNotMatch(html, /🇨🇳|🇺🇸/);
  assert.match(html, /<dialog[^>]+data-contact-dialog/);
});

test('hero component binds calculator, dialog and ACF-friendly data attributes', () => {
  const js = read('src/js/components/hero.js');
  const imports = read('src/js/_components.js');

  assert.match(imports, /import ['"]\.\/components\/hero['"]/);
  assert.match(js, /require\(['"]\.\/hero-calculator\.cjs['"]\)/);
  assert.match(js, /data-currency-rates/);
  assert.match(js, /aria-pressed/);
  assert.match(js, /animateCurrencyIndicator/);
  assert.match(js, /data-currency-indicator/);
  assert.match(js, /showModal\(\)/);
  assert.match(js, /data-dialog-summary/);
  assert.match(js, /hero:calculated/);
});

test('hero styles compile desktop, mobile, dialog and reduced-motion states', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.hero__layout\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*864px\)\s*416px/);
  assert.match(css, /\.hero__title-secondary\s*\{[^}]*var\(--text-overlay-secondary\)/s);
  assert.match(css, /\.hero__title-secondary\s*\{[^}]*max-width:\s*460px/s);
  assert.match(css, /\.hero-calculator/);
  assert.match(css, /\.hero-calculator__currencies\s*\{[^}]*position:\s*relative/s);
  assert.match(css, /\.hero-calculator__indicator/);
  assert.match(css, /\[type=number\]/);
  assert.match(css, /-moz-appearance:\s*textfield/);
  assert.match(css, /\.contact-dialog::backdrop/);
  assert.match(css, /@media \(max-width:\s*576px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('hero waits for page readiness and honors reduced motion', () => {
  const hero = read('src/js/components/hero.js');
  const preloader = read('src/js/components/preloader.js');

  assert.match(hero, /from ['"]gsap['"]/);
  assert.match(hero, /gsap\.matchMedia\(\)/);
  assert.match(hero, /platejka:ready/);
  assert.match(hero, /prefers-reduced-motion: reduce/);
  assert.match(hero, /clipPath/);
  assert.match(hero, /pointermove/);
  assert.match(hero, /gsap\.quickTo/);
  assert.match(preloader, /platejka:ready/);
});
