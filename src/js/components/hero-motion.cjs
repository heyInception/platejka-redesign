function getHeroImageOffset(normalizedX) {
  const position = Math.max(-0.5, Math.min(0.5, Number(normalizedX) || 0));
  return position < 0 ? position * 6 : position * 16;
}

module.exports = { getHeroImageOffset };
