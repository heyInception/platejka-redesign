function getMapOffsets(viewportWidth) {
  if (viewportWidth <= 768) return { x: 200, y: 270 };
  if (viewportWidth <= 1230) return { x: 300, y: 350 };
  return { x: 900, y: 350 };
}

function getShiftedCenter(markerPixels, mapSize, offsets) {
  return [
    markerPixels[0] + mapSize[0] / 2 - offsets.x,
    markerPixels[1] + mapSize[1] / 2 - offsets.y,
  ];
}

module.exports = { getMapOffsets, getShiftedCenter };
