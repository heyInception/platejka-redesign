const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');

const projectRoot = path.resolve(__dirname, '..');
const markup = fs.readFileSync(path.join(projectRoot, 'src/partials/faq.html'), 'utf8');

test('FAQ markup exposes seven accessible accordion controls with the second item open', () => {
  const $ = cheerio.load(markup);
  const section = $('section[data-faq]');
  const items = section.find('[data-faq-item]');
  const buttons = items.find('button[data-faq-trigger]');

  assert.equal(section.length, 1);
  assert.equal(section.find('h2').text().replace(/\s+/g, ' ').trim(), 'Ответы на частые вопросы');
  assert.equal(items.length, 7);
  assert.equal(buttons.length, 7);
  assert.equal(buttons.filter('[aria-expanded="true"]').length, 1);
  assert.equal(buttons.eq(1).attr('aria-expanded'), 'true');
  assert.equal(items.eq(1).find('[data-faq-panel]').is('[hidden]'), false);

  buttons.each((index, button) => {
    const panelId = $(button).attr('aria-controls');
    assert.ok(panelId, `item ${index + 1} has aria-controls`);
    assert.equal(section.find(`#${panelId}`).length, 1);
  });

  assert.equal(section.find('button[data-graph-path="call"]').length, 1);
});

test('FAQ behavior module is available to the browser entry point', () => {
  assert.doesNotThrow(() => require('../src/js/components/faq.cjs'));
});

class FakeClassList {
  constructor(classes = []) {
    this.classes = new Set(classes);
  }

  toggle(name, force) {
    if (force) this.classes.add(name);
    else this.classes.delete(name);
  }

  contains(name) {
    return this.classes.has(name);
  }
}

class FakeTrigger {
  constructor(expanded) {
    this.attributes = new Map([['aria-expanded', String(expanded)]]);
    this.listeners = new Map();
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  click() {
    this.listeners.get('click')?.();
  }
}

function makeFaqItem(expanded = false) {
  const trigger = new FakeTrigger(expanded);
  const panel = { hidden: !expanded, style: {} };
  const icon = { style: {} };
  return {
    classList: new FakeClassList(expanded ? ['is-open'] : []),
    querySelector(selector) {
      if (selector === '[data-faq-trigger]') return trigger;
      if (selector === '[data-faq-panel]') return panel;
      if (selector === '.faq__icon') return icon;
      return null;
    },
    trigger,
    panel,
    icon,
  };
}

test('FAQ keeps one item open, closes it on a repeated click and updates accessibility state', () => {
  const { initFaq } = require('../src/js/components/faq.cjs');
  const items = [makeFaqItem(), makeFaqItem(true), makeFaqItem()];
  const root = { querySelectorAll: () => items };
  const gsap = {
    killTweensOf() {},
    set(target, vars) {
      Object.assign(target.style, vars);
    },
    fromTo(target, fromVars, toVars) {
      Object.assign(target.style, fromVars, toVars);
      toVars.onComplete?.();
      return { kill() {} };
    },
    to(target, vars) {
      Object.assign(target.style, vars);
      vars.onComplete?.();
      return { kill() {} };
    },
  };

  assert.equal(initFaq(root, gsap, false), true);
  assert.equal(items[1].trigger.getAttribute('aria-expanded'), 'true');

  items[0].trigger.click();
  assert.equal(items[0].trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(items[0].panel.hidden, false);
  assert.equal(items[0].classList.contains('is-open'), true);
  assert.equal(items[1].trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(items[1].panel.hidden, true);

  items[0].trigger.click();
  assert.equal(items[0].trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(items[0].panel.hidden, true);
});
