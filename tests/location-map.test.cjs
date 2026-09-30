const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const modulePath = path.resolve(__dirname, '../src/js/components/location-map.cjs');
const locationMap = fs.existsSync(modulePath) ? require(modulePath) : {};

test('location map uses the supplied responsive offsets', () => {
  assert.equal(typeof locationMap.getMapOffsets, 'function');
  assert.deepEqual(locationMap.getMapOffsets(1440), { x: 900, y: 350 });
  assert.deepEqual(locationMap.getMapOffsets(1024), { x: 300, y: 350 });
  assert.deepEqual(locationMap.getMapOffsets(768), { x: 200, y: 270 });
});

test('location map derives a shifted global pixel center without mutating its inputs', () => {
  assert.equal(typeof locationMap.getShiftedCenter, 'function');
  const marker = [1000, 800];
  const mapSize = [592, 632];

  assert.deepEqual(
    locationMap.getShiftedCenter(marker, mapSize, { x: 900, y: 350 }),
    [396, 766],
  );
  assert.deepEqual(marker, [1000, 800]);
  assert.deepEqual(mapSize, [592, 632]);
});
