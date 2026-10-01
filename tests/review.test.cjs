const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('default review exposes complete video and text sliders', () => {
  const $ = cheerio.load(read('src/partials/review.html'));
  const section = $('.review');

  assert.equal(section.attr('aria-labelledby'), 'review-title');
  assert.equal(section.find('[role="tab"]').length, 2);
  assert.equal(section.find('[role="tabpanel"]').length, 2);
  assert.equal($('#review-video-panel [data-horizontal-slider]').length, 1);
  assert.equal($('#review-text-panel [data-horizontal-slider]').length, 1);
  assert.equal($('#review-video-panel [data-horizontal-slider-slide]').length, 3);
  assert.equal($('#review-text-panel .review__text-card').length, 2);
  assert.equal(section.find('[data-horizontal-slider-controls]').length, 2);
  assert.equal(section.find('[data-horizontal-slider-controls] button').length, 4);
  assert.equal(section.find('.review__source').length, 2);
});

test('default review compiles to the selected Figma desktop and mobile geometry', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.review\s*\{[^}]*overflow:\s*hidden[^}]*border-radius:\s*36px[^}]*padding:\s*96px 64px[^}]*min-height:\s*722px/s);
  assert.match(css, /\.review \.container\s*\{[^}]*grid-template-columns:\s*446px minmax\(0, 826px\)[^}]*gap:\s*40px/s);
  assert.match(css, /\.review__video-card\s*\{[^}]*flex:\s*0 0 254px[^}]*height:\s*450px/s);
  assert.match(css, /\.review__text-card\s*\{[^}]*flex:\s*0 0 403px[^}]*min-height:\s*450px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.review\s*\{[^}]*border-radius:\s*24px[^}]*padding:\s*36px 16px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.review__video-card\s*\{[^}]*flex-basis:\s*280px[^}]*height:\s*498\.105px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.review__text-card\s*\{[^}]*flex-basis:\s*280px[^}]*min-height:\s*450px/s);
});

test('review tab navigation supports arrows, Home and End', () => {
  const { getReviewTabIndex } = require('../src/js/components/review.cjs');

  assert.equal(getReviewTabIndex('ArrowRight', 0, 2), 1);
  assert.equal(getReviewTabIndex('ArrowRight', 1, 2), 0);
  assert.equal(getReviewTabIndex('ArrowLeft', 0, 2), 1);
  assert.equal(getReviewTabIndex('Home', 1, 2), 0);
  assert.equal(getReviewTabIndex('End', 0, 2), 1);
  assert.equal(getReviewTabIndex('Enter', 1, 2), null);
  assert.equal(getReviewTabIndex('ArrowRight', 0, 0), null);
});
