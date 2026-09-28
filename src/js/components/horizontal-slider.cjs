function clampIndex(index, count) {
  if (!Number.isFinite(index) || count < 2) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(index)));
}

function getTargetOffset(offsets, index, viewportWidth, trackWidth) {
  if (!offsets.length) return 0;
  const safeIndex = clampIndex(index, offsets.length);
  const origin = offsets[0] || 0;
  const maximum = Math.max(0, trackWidth - viewportWidth);
  return Math.min(maximum, Math.max(0, offsets[safeIndex] - origin));
}

function getReachableIndex(offsets, index, viewportWidth, trackWidth) {
  if (!offsets.length) return 0;
  const requested = clampIndex(index, offsets.length);
  const maximum = Math.max(0, trackWidth - viewportWidth);
  const target = getTargetOffset(offsets, requested, viewportWidth, trackWidth);
  if (target <= 0) return 0;
  if (target < maximum) return requested;
  const origin = offsets[0] || 0;
  const edgeIndex = offsets.findIndex((offset) => offset - origin >= maximum);
  return edgeIndex < 0 ? requested : edgeIndex;
}

function shouldShowControls(slideCount, minimum, isDesktop) {
  const threshold = Number.isFinite(minimum) ? minimum : 0;
  return !isDesktop || threshold < 1 || slideCount >= threshold;
}

function isInteractiveTarget(target) {
  return Boolean(target?.closest?.('a, button, input, select, textarea, summary, [role="button"]'));
}

module.exports = {
  clampIndex,
  getTargetOffset,
  getReachableIndex,
  shouldShowControls,
  isInteractiveTarget,
};
