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

test('about hero preserves the Figma card order at desktop and tablet sizes', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.about-hero__content\s*\{[^}]*gap:\s*40px/s);
  assert.match(css, /\.about-hero__proof-image\s*\{[^}]*order:\s*2[^}]*height:\s*144px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.about-hero__proof-image\s*\{[^}]*order:\s*initial[^}]*height:\s*96px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.about-hero__intro\s*\{[^}]*gap:\s*20px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.about-hero__metric\s*\{[^}]*gap:\s*6px/s);
});

test('about hero uses dark desktop metrics and restores light tablet cards', () => {
  const $ = cheerio.load(read('src/partials/about-hero.html'));
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.equal($('.about-hero__metric-heading img[src="img/about-hero/cb-rf-icon.svg"]').length, 1);
  assert.match(css, /\.about-hero__metric\s*\{[^}]*color:\s*var\(--text-overlay-primary\)[^}]*background:\s*rgba\(255, 255, 255, 0\.08\)/s);
  assert.match(css, /\.about-hero__metric--nps strong\s*\{[^}]*position:\s*absolute/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.about-hero__metric\s*\{[^}]*color:\s*var\(--text-primary\)[^}]*background:\s*var\(--surface-tertiary\)/s);
});

test('about hero exposes the inline signature and motion targets', () => {
  const $ = cheerio.load(read('src/partials/about-hero.html'));
  const section = $('[data-about-hero]');
  const signature = section.find('svg.about-hero__signature[data-about-hero-signature]');

  assert.equal(section.length, 1);
  assert.equal(signature.length, 1);
  assert.equal(signature.attr('role'), 'img');
  assert.equal(signature.attr('aria-label'), 'Проверено временем');
  assert.equal(section.find('[data-about-hero-proof]').length, 2);
  assert.equal(section.find('[data-about-hero-metric]').length, 5);
});

test('about hero motion waits for page readiness and honors reduced motion', () => {
  const js = read('src/js/components/about-hero.js');
  const imports = read('src/js/_components.js');

  assert.match(imports, /import ['"]\.\/components\/about-hero['"]/);
  assert.match(js, /from ['"]gsap['"]/);
  assert.match(js, /platejka:ready/);
  assert.match(js, /dataset\.pageReady/);
  assert.match(js, /prefers-reduced-motion: reduce/);
  assert.match(js, /data-about-hero-signature-reveal/);
});
