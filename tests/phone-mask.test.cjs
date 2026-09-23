const test = require('node:test');
const assert = require('node:assert/strict');

test('global phone mask initializes every unmasked js-phone-mask field once', () => {
  const { initPhoneMasks, PHONE_MASK } = require('../src/js/components/phone-mask.cjs');
  const fields = [
    { dataset: {} },
    { dataset: { phoneMaskReady: 'true' } },
    { dataset: {} },
  ];
  const applied = [];
  class FakeInputmask {
    constructor(pattern, options) {
      this.pattern = pattern;
      this.options = options;
    }

    mask(field) {
      applied.push({ field, pattern: this.pattern, options: this.options });
    }
  }
  const scope = { querySelectorAll: () => fields };

  assert.equal(initPhoneMasks(scope, FakeInputmask), 2);
  assert.equal(PHONE_MASK, '+7 (999) 999-99-99');
  assert.deepEqual(applied.map(({ field }) => field), [fields[0], fields[2]]);
  assert.equal(fields[0].dataset.phoneMaskReady, 'true');
  assert.equal(fields[2].dataset.phoneMaskReady, 'true');
});

test('global phone mask safely handles a missing document or constructor', () => {
  const { initPhoneMasks } = require('../src/js/components/phone-mask.cjs');

  assert.equal(initPhoneMasks(null, class {}), 0);
  assert.equal(initPhoneMasks({ querySelectorAll: () => [] }, null), 0);
});
