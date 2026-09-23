const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Footer exposes the Penpot content as semantic navigation and contact information', () => {
  const $ = cheerio.load(read('src/partials/footer.html'));
  const footer = $('footer.footer');
  const navigations = footer.find('nav[aria-labelledby]');

  assert.equal(footer.length, 1);
  assert.equal(footer.find('address').length, 1);
  assert.equal(navigations.length, 3);
  assert.deepEqual(
    navigations.find('h2').map((index, heading) => $(heading).text().trim()).get(),
    ['Информация', 'Услуги', 'Новости'],
  );
  assert.equal(footer.find('.footer__logo-link[aria-label]').length, 1);
  assert.equal(footer.find('.footer__registry-label').text().trim(), 'Внесён в реестр ЦБ');
  assert.match(footer.text(), /2009–2026, сервис «Платёжка»/);
  assert.match(footer.text(), /не является публичной офертой/);

  const links = footer.find('a');
  assert.equal(links.length, 25);
  links.each((index, link) => {
    assert.equal($(link).attr('href'), '#', `link ${index + 1} uses the placeholder destination`);
  });
});

test('Footer is included after the main content on China page', () => {
  const page = read('src/china.html');
  assert.match(page, /<\/main>\s*@include\(['"]partials\/footer\.html['"]\)/);
});

test('Footer styles compile to the Penpot desktop and tablet layouts', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.footer__panel\s*\{[^}]*min-height:\s*692px[^}]*border-radius:\s*40px[^}]*padding:\s*64px 64px 40px/s);
  assert.match(css, /\.footer__main\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*448px\)\s+minmax\(0,\s*1fr\)[^}]*gap:\s*40px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*\.footer__panel\s*\{[^}]*min-height:\s*1586px[^}]*border-radius:\s*0[^}]*padding:\s*64px 8px 24px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*\.footer__main\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)[^}]*gap:\s*24px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*\.footer__navigation\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)[^}]*gap:\s*32px/s);
});
