const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const partial = (name) => cheerio.load(read(`src/partials/${name}.html`));

test('location exposes four office slides, desktop-only threshold controls and an empty map mount', () => {
  const $ = partial('location');
  const section = $('.location');
  assert.equal(section.attr('aria-labelledby'), 'location-title');
  assert.equal(section.attr('data-horizontal-slider-min-controls'), '4');
  assert.notEqual(section.attr('data-horizontal-slider-desktop-controls'), undefined);
  assert.equal(section.find('[data-horizontal-slider-slide]').length, 4);
  assert.equal(section.find('[data-location-map]').children().length, 0);
  assert.equal(section.find('img[src*="map"]').length, 0);
});

test('infrastructure contains specializations, three facts and all legal entities', () => {
  const $ = partial('infrastructure');
  assert.equal($('.infrastructure').attr('aria-labelledby'), 'infrastructure-title');
  assert.equal($('.infrastructure__fact').length, 3);
  assert.equal($('.infrastructure__entity').length, 11);
  assert.match($.text(), /Ключевые специализации/);
});

test('financial section contains compliance workflow, case, seven banks and test payment callout', () => {
  const $ = partial('financial');
  assert.equal($('.financial').attr('aria-labelledby'), 'financial-title');
  assert.equal($('.financial__benefit').length, 3);
  assert.equal($('.financial__bank').length, 7);
  assert.match($.text(), /Решили за 24 часа/);
  assert.match($.text(), /Возможность тестового платежа/);
});

test('employees is a static semantic testimonial without slider controls', () => {
  const $ = partial('employees');
  assert.equal($('.employees').attr('aria-labelledby'), 'employees-title');
  assert.equal($('[data-horizontal-slider]').length, 0);
  assert.equal($('[data-horizontal-slider-prev], [data-horizontal-slider-next]').length, 0);
  assert.match($.text(), /Клочков Михаил/);
});

test('exhibitions is an overflowing four-card slider with mobile-hidden controls', () => {
  const $ = partial('exhibitions');
  assert.equal($('.exhibitions').attr('aria-labelledby'), 'exhibitions-title');
  assert.equal($('[data-horizontal-slider-slide]').length, 4);
  assert.notEqual($('.exhibitions').attr('data-horizontal-slider-desktop-controls'), undefined);
});

test('developing has seven synced years, seven slides and exact desktop threshold', () => {
  const $ = partial('developing');
  assert.equal($('.developing').attr('aria-labelledby'), 'developing-title');
  assert.equal($('.developing').attr('data-horizontal-slider-min-controls'), '7');
  assert.notEqual($('.developing').attr('data-horizontal-slider-desktop-controls'), undefined);
  assert.equal($('[data-horizontal-slider-go-to]').length, 7);
  assert.equal($('[data-horizontal-slider-slide]').length, 7);
});

test('about call keeps the form and adds two lower contact cards', () => {
  const $ = partial('call-about');
  assert.equal($('.call__form form').length, 1);
  assert.equal($('.call-about__card').length, 2);
  assert.match($.text(), /Свяжитесь с нами/);
  assert.match($.text(), /Читайте нас в соцсетях/);
});

test('about sections switch at tablet and keep slider content flexible', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.location/);
  assert.match(css, /\.exhibitions__track\s*\{[^}]*width:\s*max-content/s);
  assert.match(css, /\.developing__track\s*\{[^}]*width:\s*max-content/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.developing[^}]*[\s\S]*?\.slider-controls\s*\{[^}]*display:\s*none/s);
});
