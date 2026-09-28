const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('about page composes the approved sections in order', () => {
  const page = read('src/about.html');
  const partials = [
    'about-hero',
    'location',
    'review-main',
    'infrastructure',
    'financial',
    'employees',
    'exhibitions',
    'developing',
    'call-about',
  ];
  const positions = partials.map((name) => page.indexOf(`partials/${name}.html`));

  assert.ok(positions.every((position) => position !== -1));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test('about hero uses semantic, content-flexible cards and complete proof content', () => {
  const $ = cheerio.load(read('src/partials/about-hero.html'));
  const section = $('.about-hero');

  assert.equal(section.attr('aria-labelledby'), 'about-hero-title');
  assert.equal(section.find('h1#about-hero-title').length, 1);
  assert.equal(section.find('.about-hero__proof').length, 2);
  assert.equal(section.find('.about-hero__metric').length, 5);
  assert.equal(section.find('img:not([alt])').length, 0);
  assert.match(section.text(), /Ваш надёжный платёжный агент/);
  assert.match(section.text(), /Внесены в реестр ЦБ РФ/);
  assert.match(section.text(), /В ассоциации платёжных агентов/);
  assert.match(section.text(), /318\+/);
  assert.match(section.text(), /NPS индекс потребительской лояльности/);
});

test('about hero follows desktop and tablet layouts without fixed content heights', () => {
  const source = read('src/scss/components/_about-hero.scss');
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.about-hero__visual\s*\{[^}]*min-height:\s*720px/s);
  assert.match(css, /\.about-hero__title\s*\{[^}]*font:\s*700 64px\s*\/\s*64px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.about-hero__title\s*\{[^}]*font:\s*700 30px\s*\/\s*34px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.about-hero__metrics\s*\{[^}]*overflow-x:\s*auto/s);
  assert.doesNotMatch(source, /\.about-hero__(?:content|intro|proof|proof-copy|metrics|metric)\s*\{[^}]*\bheight\s*:/s);
});
