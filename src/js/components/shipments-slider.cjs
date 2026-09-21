function getClosestSlideIndex(scrollLeft, step, count) {
  if (!Number.isFinite(step) || step <= 0 || !Number.isFinite(count) || count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(scrollLeft / step)));
}

module.exports = { getClosestSlideIndex };
