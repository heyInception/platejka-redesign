const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');

const root = path.resolve(__dirname, '..');
const $ = cheerio.load(fs.readFileSync(path.join(root, 'src/partials/seo.html'), 'utf8'));

test('SEO content is semantic and readable without JavaScript', () => {
  const section = $('section[data-seo-section]');

  assert.equal(section.length, 1);
  assert.equal(section.find('h2').first().text().trim(), 'Платежи в Китай');
  assert.equal(section.find('button[data-seo-toggle][hidden]').length, 1);
  assert.equal(section.find('[data-seo-content]:not([hidden])').length, 1);
  assert.equal(section.find('.seo__mobile-extra').length, 1);
  assert.equal(section.find('.seo__card').length, 6);
  assert.equal(section.find('[id]').length, 0);
  assert.match(section.text(), /сейчас, в 2026 году\./);
  assert.match(section.text(), /Почему прямые переводы в Китай не работают/);
  assert.match(section.text(), /Контроль комплаенса/);
});
