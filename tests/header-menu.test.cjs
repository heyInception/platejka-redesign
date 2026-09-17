const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('burger is a 20px control with two 15px lines', () => {
  const scss = read('src/scss/mixins/_burger.scss');

  assert.match(scss, /--burger-width:\s*20px/);
  assert.match(scss, /--burger-height:\s*20px/);
  assert.match(scss, /--burger-line-width:\s*15px/);
  assert.doesNotMatch(scss, /&__line/);
});

test('mobile navigation contains real menu entries and the full contact block', () => {
  const html = read('src/partials/header.html');

  assert.doesNotMatch(html, />Тест</);
  assert.match(html, /data-menu-content/);
  assert.match(html, /Swift переводы/);
  assert.match(html, /Переводы в Турцию для юридических лиц/);
  assert.match(html, /Расчётный счёт 40702810700000033434/);
  assert.match(html, /Корреспондентский счёт 30101810945250000666/);
});

test('menu script handles overlay state, nested accordions and accessible closing', () => {
  const js = `${read('src/js/functions/burger.js')}\n${read('src/js/components/header.js')}`;

  assert.match(js, /data-nav-toggle/);
  assert.match(js, /classList\.contains\('nav__submenu'\)/);
  assert.match(js, /document\.documentElement\.classList/);
  assert.match(js, /event\.key === 'Escape'/);
  assert.match(js, /max-width:\s*1024px/);
  assert.doesNotMatch(js, /jQuery/);
});

test('mobile navigation is a viewport panel with independent scrolling', () => {
  const scss = read('src/scss/components/_header.scss');

  assert.match(scss, /position:\s*fixed/);
  assert.match(scss, /overflow-y:\s*auto/);
  assert.match(scss, /\.menu-open/);
});

test('submenu links navigate independently while toggles use the shared chevron asset', () => {
  const js = read('src/js/functions/burger.js');
  const scss = read('src/scss/components/_header.scss');

  assert.doesNotMatch(js, /event\.preventDefault\(\)/);
  assert.doesNotMatch(js, /heading && toggle/);
  assert.match(scss, /background-image:\s*url\(\.\.\/\.\.\/img\/svg\/chavron-down\.svg\)/);
  assert.match(scss, /\[aria-expanded="true"\][\s\S]*?transform:\s*rotate\(180deg\)/);
});

test('header responsive styles use one shared tablet mixin without empty breakpoint blocks', () => {
  const scss = read('src/scss/components/_header.scss');
  const tabletIncludes = scss.match(/@include tablet\s*\{/g) || [];

  assert.equal(tabletIncludes.length, 1);
  assert.doesNotMatch(scss, /@media\s*\(max-width:\s*1024px\)/);
  assert.doesNotMatch(scss, /@include\s+(?:desktop|mobile)\s*\{\s*\}/);
});
