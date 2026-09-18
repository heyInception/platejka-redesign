const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('about partial exposes a semantic, repeatable section contract', () => {
  const html = read('src/partials/about.html');

  assert.match(html, /<section[^>]+data-about/);
  assert.match(html, /<h2\b[^>]*>/);
  assert.match(html, /<a[^>]+href="#"[^>]*>[^<]*<span[^>]*>Образец агентского договора/s);
  assert.equal((html.match(/class="about-card"/g) || []).length, 2);
  assert.equal((html.match(/href="#"/g) || []).length, 3);
  assert.match(html, /<button[^>]+data-about-dialog-open/);
  assert.match(html, /<dialog[^>]+data-about-dialog[^>]+aria-label="Записаться на встречу"/);
  assert.doesNotMatch(html, /\sid="[^"]+"/);
});

test('about component initializes every dialog instance without section animation', () => {
  const js = read('src/js/components/about.js');
  const imports = read('src/js/_components.js');

  assert.match(imports, /import ['"]\.\/components\/about['"]/);
  assert.match(js, /querySelectorAll\(['"]\[data-about\]['"]\)/);
  assert.match(js, /root\.querySelector\(['"]\[data-about-dialog\]['"]\)/);
  assert.match(js, /showModal\(\)/);
  assert.match(js, /dialog\.close\(\)/);
  assert.match(js, /dialogOpener/);
  assert.doesNotMatch(js, /from ['"]gsap['"]|IntersectionObserver|initAboutMotion|gsap\./);
});

test('about styles compile desktop, mobile and dialog states without animation hints', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.about__layout\s*\{[^}]*grid-template-columns:\s*592px\s+minmax\(0,\s*688px\)/s);
  assert.match(css, /\.about__media\s*\{[^}]*aspect-ratio:\s*1/s);
  assert.match(css, /\.about-card__image\s*\{[^}]*width:\s*144px[^}]*height:\s*144px/s);
  assert.match(css, /\.about-dialog::backdrop/);
  assert.match(css, /@media \(max-width:\s*576px\)/);
  assert.doesNotMatch(css, /\.about(?:__media|__intro|__cta| |-card)[^{]*\{[^}]*will-change/s);
});
