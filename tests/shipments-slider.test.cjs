const test = require('node:test');
const assert = require('node:assert/strict');

const { getClosestSlideIndex } = require('../src/js/components/shipments-slider.cjs');

test('slider snaps to the closest card and clamps to its bounds', () => {
  assert.equal(getClosestSlideIndex(0, 288, 6), 0);
  assert.equal(getClosestSlideIndex(150, 288, 6), 1);
  assert.equal(getClosestSlideIndex(1600, 288, 6), 5);
  assert.equal(getClosestSlideIndex(-100, 288, 6), 0);
});

test('slider falls back safely when dimensions are unavailable', () => {
  assert.equal(getClosestSlideIndex(120, 0, 6), 0);
  assert.equal(getClosestSlideIndex(120, 288, 0), 0);
});
