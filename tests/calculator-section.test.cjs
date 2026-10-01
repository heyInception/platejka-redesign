const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('reusable calculator section has labelled controls and result outputs', () => {
  const $ = cheerio.load(read('src/partials/calculator.html'));
  const section = $('section[data-transfer-calculator-section]');
  const form = section.find('form[data-transfer-calculator]');

  assert.equal(section.length, 1);
  assert.equal(section.find('.calculator__heading h2').length, 1);
  assert.equal(form.length, 1);
  assert.deepEqual(form.find('[data-currency]').map((_, el) => $(el).attr('data-currency')).get(), ['CNY', 'USD', 'EUR']);
  assert.equal(form.find('[data-currency-indicator]').length, 1);
  assert.equal(form.find('label:has(select[data-role="country-from"])').length, 1);
  assert.equal(form.find('label:has(select[data-role="country-to"])').length, 1);
  assert.equal(form.find('label:has(input[data-role="amount"])').length, 1);
  assert.equal(form.find('select[data-role="country-from"] option[value="RU"]').length, 1);
  assert.equal(form.find('select[data-role="country-to"] option[value="CN"]').length, 1);
  assert.ok(form.find('select[data-role="country-to"] option').length >= 50);
  assert.equal(section.find('[id]').length, 0);
  assert.equal(form.find('output[data-role="grand-total"]').length, 1);
  assert.equal(form.find('button[data-action="telegram"]').length, 1);
  assert.equal(form.find('button[data-action="request"]').length, 1);
  assert.equal(section.find('dialog[data-contact-dialog] [data-cf7-mount]').length, 1);
  assert.equal(JSON.parse(form.attr('data-currency-rates')).EUR, 90);
});

test('calculator section switches to stacked layout at tablet breakpoint', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;
  assert.match(css, /\.calculator\s*\{/);
  assert.match(css, /\.calculator__panel\s*\{/);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.calculator__columns\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test('calculator country selects opt into Select2 with the approved search behavior', () => {
  const $ = cheerio.load(read('src/partials/calculator.html'));
  const countryFrom = $('[data-role="country-from"]');
  const countryTo = $('[data-role="country-to"]');

  assert.equal(countryFrom.attr('data-calculator-select'), 'country');
  assert.equal(countryFrom.attr('data-search-enabled'), 'false');
  assert.equal(countryTo.attr('data-calculator-select'), 'country');
  assert.equal(countryTo.attr('data-search-enabled'), 'true');
  assert.equal(countryFrom.find('option[value="RU"]').attr('data-flag'), '../img/ru-flag.png');
  assert.equal(countryTo.find('option[value="CN"]').attr('data-flag'), '../img/cn-flag.png');
});

test('Select2 is loaded through the existing vendor bundles before components', () => {
  const packageJson = JSON.parse(read('package.json'));
  const vendorJs = read('src/js/_vendor.js');
  const vendorScss = read('src/scss/vendor.scss');
  const mainJs = read('src/js/main.js');

  assert.match(packageJson.dependencies.jquery, /^\^?3\./);
  assert.match(vendorJs, /require\(['"]\.\/vendor\/select2\.min\.js['"]\)/);
  assert.doesNotMatch(vendorJs, /require\(['"]\.\/vendor\/select2\.min\.js['"]\)\s*;?[\s\S]*?\(window,\s*\$\)/);
  assert.match(vendorJs, /window\.jQuery\s*=\s*window\.\$\s*=\s*\$/);
  assert.match(vendorScss, /@import\s+["']\.\/vendor\/select2\.min["']/);
  assert.ok(mainJs.indexOf("import './_vendor'") < mainJs.indexOf("import './_components'"));
});

test('calculator Select2 configuration localizes search and preserves native fallback', () => {
  const js = read('src/js/components/calculator-select.js');

  assert.match(js, /\[data-calculator-select\]/);
  assert.match(js, /minimumResultsForSearch/);
  assert.match(js, /Страна не найдена/);
  assert.match(js, /Поиск страны/);
  assert.match(js, /data\('select2'\)/);
  assert.match(js, /dataset\.flag/);
});

test('calculator Select2 matches every Figma select state', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;
  const base = css.match(/\.calculator__select-wrap \.select2-container \.select2-selection--single\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(base, /height:\s*60px/);
  assert.match(base, /border:\s*0/);
  assert.match(base, /border-radius:\s*16px/);
  assert.match(css, /\.calculator__select-wrap \.select2-container:hover \.select2-selection--single\s*\{[^}]*background:\s*#f4f6fb/s);
  assert.match(css, /\.calculator__select-wrap \.select2-container--focus \.select2-selection--single\s*\{[^}]*border:\s*2px solid #007336/s);
  assert.match(css, /\.calculator__select-wrap \.select2-container--default\.select2-container--open \.select2-selection--single\s*\{[^}]*border:\s*2px solid #007336[^}]*border-radius:\s*16px/s);
  assert.match(css, /\.calculator__select-wrap select\[aria-invalid=true\] \+ \.select2-container \.select2-selection--single\s*\{[^}]*border:\s*2px solid #c7342a/s);
  assert.match(css, /\.calculator__select-wrap \.select2-container--disabled \.select2-selection--single\s*\{[^}]*background:\s*#f4f6fb/s);
  assert.match(css, /\.calculator__select-wrap \.select2-container--disabled \.select2-selection__rendered\s*\{[^}]*opacity:\s*0\.4/s);
});
