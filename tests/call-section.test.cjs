const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Call partial exposes a reusable, labelled contact form', () => {
  const $ = cheerio.load(read('src/partials/call.html'));
  const section = $('section[data-call]');
  const form = section.find('form');

  assert.equal(section.length, 1);
  assert.equal(section.find('h2#call-title').length, 1);
  assert.equal(section.attr('aria-labelledby'), 'call-title');
  assert.equal(section.find('[data-call-card]').length, 3);
  assert.equal(form.length, 1);
  assert.equal(form.find('input.js-phone-mask[type="tel"][name="phone"]').length, 1);
  assert.equal(form.find('input[type="email"][name="email"]').length, 1);
  assert.equal(form.find('textarea[name="message"]').length, 1);
  assert.match(form.find('button[type="submit"]').text().replace(/\s+/g, ' ').trim(), /^Отправить заявку/);
  assert.equal(form.find('input[type="checkbox"][name="privacy"][required]').length, 1);

  form.find('input:not([type="checkbox"]), textarea').each((index, field) => {
    assert.ok($(field).attr('aria-label'), `field ${index + 1} has an accessible name`);
  });
});

test('Call component is included on China page and initialized', () => {
  assert.match(read('src/china.html'), /@include\(['"]partials\/call\.html['"]\)/);
  assert.match(read('src/js/_components.js'), /import ['"]\.\/components\/call['"]/);
});

test('Call styles compile to Penpot desktop and tablet layouts', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.call__panel\s*\{[^}]*border-radius:\s*40px[^}]*padding:\s*48px/s);
  assert.match(css, /\.call__layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*691px\)\s+minmax\(0,\s*1fr\)[^}]*gap:\s*60px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*\.call__panel\s*\{[^}]*border-radius:\s*0[^}]*padding:\s*24px 8px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*\.call__layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)[^}]*gap:\s*24px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*\.call__form\s*\{[^}]*padding:\s*16px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*\.call__form \.ui-input,[\s\S]*\.call__submit\s*\{[^}]*min-height:\s*60px/s);
});

test('Call motion runs once and reduced motion leaves content visible', () => {
  const { initCallMotion } = require('../src/js/components/call-motion.cjs');
  const targets = {
    title: {},
    cards: [{}, {}, {}],
    form: {},
  };
  const rootElement = {
    querySelector(selector) {
      if (selector === '[data-call-title]') return targets.title;
      if (selector === '[data-call-form]') return targets.form;
      return null;
    },
    querySelectorAll(selector) {
      return selector === '[data-call-card]' ? targets.cards : [];
    },
  };
  const calls = [];
  const timeline = {
    from(target, vars, position) {
      calls.push({ target, vars, position });
      return this;
    },
  };
  const gsap = {
    set(target, vars) { calls.push({ set: target, vars }); },
    timeline(config) { calls.push({ config }); return timeline; },
  };

  assert.equal(initCallMotion(rootElement, gsap, true), null);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].vars, { clearProps: 'all' });

  calls.length = 0;
  assert.equal(initCallMotion(rootElement, gsap, false), timeline);
  assert.equal(calls[0].config.scrollTrigger.trigger, rootElement);
  assert.equal(calls[0].config.scrollTrigger.once, true);
  assert.equal(calls.filter((call) => call.target).length, 3);
});

test('Call placeholder form cancels navigation until a backend is connected', () => {
  const { initCallForm } = require('../src/js/components/call-motion.cjs');
  let submitHandler;
  const form = {
    addEventListener(type, handler) {
      if (type === 'submit') submitHandler = handler;
    },
  };
  const rootElement = { querySelector: (selector) => selector === 'form' ? form : null };
  let prevented = false;

  assert.equal(initCallForm(rootElement), true);
  submitHandler({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
});
