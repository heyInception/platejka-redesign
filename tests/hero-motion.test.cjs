const test = require('node:test');
const assert = require('node:assert/strict');

const { getHeroImageOffset } = require('../src/js/components/hero-motion.cjs');

test('hero image parallax is restrained on the left and allows motion to the right', () => {
  assert.equal(getHeroImageOffset(-0.5), -3);
  assert.equal(getHeroImageOffset(0), 0);
  assert.equal(getHeroImageOffset(0.5), 8);
});

test('hero image parallax clamps pointer positions outside the panel', () => {
  assert.equal(getHeroImageOffset(-2), -3);
  assert.equal(getHeroImageOffset(2), 8);
});
