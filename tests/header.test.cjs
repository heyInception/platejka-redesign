const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('header uses semantic and accessible navigation markup', () => {
  const html = read('src/partials/header.html');

  assert.match(html, /<nav[^>]+aria-label="Основная навигация"/);
  assert.match(html, /class="header__logo-link"[^>]+aria-label="Платёжка — на главную"/);
  assert.match(html, /class="[^"]*nav__toggle[^"]*"[^>]+aria-expanded="false"[^>]+aria-controls=/);
  assert.match(html, /<ul[^>]+class="list-reset nav__submenu"/);
  assert.match(html, /href="mailto:a@platejka\.com"/);
  assert.match(html, /href="tel:\+78005338819"/);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'menu ids must be unique');
  assert.match(html, /nav__subitem--has-children/);
  assert.match(html, /nav__submenu--nested/);
});

test('header logo stays hidden until the preloader completion event starts its intro', () => {
  const js = read('src/js/components/header.js');
  const scss = read('src/scss/components/_header.scss');

  assert.match(scss, /&__logo-link\s*\{[\s\S]*?opacity:\s*0;[\s\S]*?visibility:\s*hidden;/);
  assert.match(js, /platejka:preloader-complete/);
  assert.match(js, /\.set\(logo,\s*\{\s*autoAlpha:\s*1\s*\}\)/);
});

test('all navigation controls use the UI kit hover treatment', () => {
  const css = sass.compile(
    path.join(root, 'src/scss/components/_header.scss'),
    { style: 'expanded' },
  ).css;

  assert.match(css, /\.nav__link:hover[^{]*\{[^}]*opacity:\s*0\.72/s);
  assert.match(css, /\.nav__toggle:hover[^{]*\{[^}]*opacity:\s*0\.72/s);
  assert.match(css, /\.nav__sublink\s*\{[^}]*opacity:\s*1/s);
  assert.match(css, /\.nav__sublink:hover[^{]*\{[^}]*opacity:\s*0\.72/s);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*?\.nav__link[\s\S]*?transition:\s*none/s);
});

test('header component uses GSAP timelines and supports reduced motion', () => {
  const js = read('src/js/components/header.js');
  const head = read('src/partials/head.html');

  assert.match(js, /from ['"]gsap['"]/);
  assert.match(head, /<script defer src="js\/main\.js"><\/script>/);
  assert.match(js, /gsap\.timeline/);
  assert.match(js, /header__logo-word > path/);
  assert.match(js, /duration:\s*0\.22/);
  assert.match(js, /stagger:\s*0\.06/);
  assert.match(js, /clearProps:\s*['"]opacity['"]/);
  assert.match(js, /prefers-reduced-motion: reduce/);
  assert.match(js, /aria-expanded/);
  assert.match(js, /querySelectorAll\('\.nav__toggle'\)/);
  assert.match(js, /getMenuDepth/);
  assert.match(js, /menuDepth > 2/);
  assert.match(js, /Закрыть подменю/);
  assert.match(js, /Escape/);
});

test('header styles keep submenus positioned and focus-visible', () => {
  const scss = read('src/scss/components/_header.scss');

  assert.match(scss, /\.nav__submenu/);
  assert.match(scss, /position:\s*absolute/);
  assert.match(scss, /:focus-visible/);
  assert.match(scss, /will-change:\s*transform, opacity/);
  assert.match(scss, /height:\s*14px/);
  assert.match(scss, /&--nested/);
  assert.match(scss, /\.site-container\s*{[\s\S]*?overflow:\s*visible/);
  assert.match(scss, /\.page__body\s*{[\s\S]*?overflow-x:\s*clip/);
});
