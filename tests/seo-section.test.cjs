const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const { initSeoSections } = require('../src/js/components/seo.cjs');

const projectRoot = path.resolve(__dirname, '..');
const markup = fs.readFileSync(path.join(projectRoot, 'src/partials/seo.html'), 'utf8');

test('SEO section exposes only behavior hooks without hiding source content', () => {
  const $ = cheerio.load(markup);
  const section = $('section[data-seo]');
  const content = section.find('[data-seo-content]');
  const children = content.children();

  assert.equal(section.length, 1);
  assert.equal(content.length, 1);
  assert.equal(children.first().prop('tagName'), 'H2');
  assert.equal(children.eq(1).prop('tagName'), 'P');
  assert.ok(children.length > 2);
  assert.equal(content.is('[hidden]'), false);
  assert.equal(section.find('button[data-seo-toggle][hidden]').length, 1);
});

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.hidden = false;
    this.textContent = '';
    this.scrollHeight = 320;
    this.offsetHeight = 320;
    this.attributes = new Map();
    this.listeners = new Map();
  }

  appendChild(child) {
    child.parentNode?.removeChild(child);
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  insertBefore(child, reference) {
    child.parentNode?.removeChild(child);
    const index = this.children.indexOf(reference);
    child.parentNode = this;
    this.children.splice(index, 0, child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) this.children.splice(index, 1);
    child.parentNode = null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  dispatch(name, event = {}) {
    this.listeners.get(name)?.(event);
  }
}

function makeSeoFixture(doc) {
  const content = new FakeElement('div', doc);
  ['h2', 'p', 'p', 'h3', 'p'].forEach((tagName) => {
    content.appendChild(new FakeElement(tagName, doc));
  });

  const button = new FakeElement('button', doc);
  button.hidden = true;
  button.dataset.seoShowLabel = 'Показать ещё';
  button.dataset.seoHideLabel = 'Скрыть';

  const root = {
    querySelector(selector) {
      if (selector === '[data-seo-content]') return content;
      if (selector === '[data-seo-toggle]') return button;
      return null;
    },
  };

  return { root, content, button };
}

test('SEO content expands and collapses independently with accessible state', () => {
  const originalWindow = global.window;
  const originalRequestAnimationFrame = global.requestAnimationFrame;

  global.window = { matchMedia: () => ({ matches: false }) };
  global.requestAnimationFrame = (callback) => callback();

  try {
    const doc = { createElement: (tagName) => new FakeElement(tagName, doc) };
    const first = makeSeoFixture(doc);
    const second = makeSeoFixture(doc);
    doc.querySelectorAll = () => [first.root, second.root];

    assert.equal(initSeoSections(doc), 2);
    assert.equal(first.content.children.length, 3);

    const collapsible = first.content.children[2];
    assert.equal(collapsible.dataset.seoCollapsible, '');
    assert.equal(collapsible.children.length, 3);
    assert.equal(collapsible.hidden, true);
    assert.equal(first.button.hidden, false);
    assert.equal(first.button.textContent, 'Показать ещё');
    assert.equal(first.button.getAttribute('aria-expanded'), 'false');

    first.button.dispatch('click');
    assert.equal(collapsible.hidden, false);
    assert.equal(collapsible.style.height, '320px');
    assert.equal(first.button.textContent, 'Скрыть');
    assert.equal(first.button.getAttribute('aria-expanded'), 'true');
    assert.equal(second.content.children[2].hidden, true);

    collapsible.dispatch('transitionend', { propertyName: 'height' });
    assert.equal(collapsible.style.height, 'auto');

    first.button.dispatch('click');
    assert.equal(collapsible.style.height, '0px');
    assert.equal(collapsible.hidden, false);
    assert.equal(first.button.textContent, 'Показать ещё');
    assert.equal(first.button.getAttribute('aria-expanded'), 'false');

    collapsible.dispatch('transitionend', { propertyName: 'height' });
    assert.equal(collapsible.hidden, true);
  } finally {
    global.window = originalWindow;
    global.requestAnimationFrame = originalRequestAnimationFrame;
  }
});

test('SEO content switches instantly when reduced motion is requested', () => {
  const originalWindow = global.window;
  global.window = { matchMedia: () => ({ matches: true }) };

  try {
    const doc = { createElement: (tagName) => new FakeElement(tagName, doc) };
    const fixture = makeSeoFixture(doc);
    doc.querySelectorAll = () => [fixture.root];

    initSeoSections(doc);
    const collapsible = fixture.content.children[2];

    fixture.button.dispatch('click');
    assert.equal(collapsible.hidden, false);
    assert.equal(collapsible.style.height, 'auto');

    fixture.button.dispatch('click');
    assert.equal(collapsible.hidden, true);
    assert.equal(collapsible.style.height, '0px');
  } finally {
    global.window = originalWindow;
  }
});
