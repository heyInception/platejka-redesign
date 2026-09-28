const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clampIndex,
  getTargetOffset,
  getReachableIndex,
  shouldShowControls,
  isIndexedControlActive,
  isInteractiveTarget,
} = require('../src/js/components/horizontal-slider.cjs');

test('clamps indexes including empty and single-card sliders', () => {
  assert.equal(clampIndex(-1, 3), 0);
  assert.equal(clampIndex(9, 3), 2);
  assert.equal(clampIndex(1, 1), 0);
  assert.equal(clampIndex(1, 0), 0);
});

test('targets measured slide offsets and clamps to track edge', () => {
  assert.equal(getTargetOffset([0, 448, 896], 1, 416, 1312), 448);
  assert.equal(getTargetOffset([0, 448, 896], 2, 600, 1312), 712);
  assert.equal(getTargetOffset([0], 0, 600, 280), 0);
});

test('normalizes the index to the first slide that reaches the track edge', () => {
  assert.equal(getReachableIndex([0, 448, 896, 1344], 3, 600, 1500), 3);
  assert.equal(getReachableIndex([0, 448, 896, 1344], 3, 600, 1312), 2);
  assert.equal(getReachableIndex([0], 0, 600, 280), 0);
});

test('uses desktop card-count thresholds without hiding mobile controls', () => {
  assert.equal(shouldShowControls(4, 5, true), false);
  assert.equal(shouldShowControls(5, 5, true), true);
  assert.equal(shouldShowControls(3, 4, true), false);
  assert.equal(shouldShowControls(4, 4, true), true);
  assert.equal(shouldShowControls(3, 4, false), true);
});

test('desktop-only controls stay hidden on mobile and honor exact thresholds', () => {
  assert.equal(shouldShowControls(3, 4, true, true), false);
  assert.equal(shouldShowControls(4, 4, true, true), true);
  assert.equal(shouldShowControls(6, 7, true, true), false);
  assert.equal(shouldShowControls(7, 7, true, true), true);
  assert.equal(shouldShowControls(7, 7, false, true), false);
  assert.equal(shouldShowControls(3, 4, false), true);
});

test('indexed controls expose only the reachable active slide', () => {
  assert.equal(isIndexedControlActive('0', 0, 7), true);
  assert.equal(isIndexedControlActive('4', 4, 7), true);
  assert.equal(isIndexedControlActive('6', 5, 7), false);
  assert.equal(isIndexedControlActive('12', 6, 7), false);
  assert.equal(isIndexedControlActive('year', 0, 7), false);
});

test('does not start a drag gesture from an interactive card control', () => {
  assert.equal(isInteractiveTarget({ closest: () => ({}) }), true);
  assert.equal(isInteractiveTarget({ closest: () => null }), false);
  assert.equal(isInteractiveTarget(null), false);
});
