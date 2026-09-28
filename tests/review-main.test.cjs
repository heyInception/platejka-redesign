const fs = require('node:fs'); const path = require('node:path'); const test = require('node:test'); const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'); const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
test('main review contains both accessible tab panels and slider controls', () => {
  const html = read('src/partials/review-main.html');
  assert.match(html, /<section[^>]+data-review/); assert.equal((html.match(/role="tab"/g) || []).length, 2); assert.equal((html.match(/role="tabpanel"/g) || []).length, 2);
  assert.match(html, /aria-selected="true"[^>]*>Видео-отзывы/); assert.equal((html.match(/review-main__text-card/g) || []).length, 3); assert.equal((html.match(/data-horizontal-slider(?:\s|>)/g) || []).length, 2); assert.match(html, /data-review-video/);
  assert.match(html, /data-horizontal-slider-min-controls="5"/);
  assert.match(html, /data-horizontal-slider-min-controls="4"/);
  assert.equal((html.match(/data-horizontal-slider-slide/g) || []).length, 8);
  assert.match(html, /aria-label="Закрыть видеоотзыв"/);
});
test('review behavior initializes every local root and preserves empty/error states', () => {
  const js = read('src/js/components/review.js'); assert.match(js, /querySelectorAll\('\[data-review\]'\)/); assert.match(js, /Видео скоро появится/); assert.match(js, /review-video-error/);
});

test('text reviews have content-driven height', () => {
  const scss = read('src/scss/components/_review-main.scss');
  const cardRule = scss.match(/&__text-card\s*\{([^}]+)\}/)?.[1] || '';
  assert.doesNotMatch(cardRule, /(?:min-|max-)?height\s*:/);
});
