const fs = require('node:fs'); const path = require('node:path'); const test = require('node:test'); const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'); const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
test('with-us has six cards and tablet slider hooks', () => { const html = read('src/partials/with-us.html'); assert.equal((html.match(/<article/g) || []).length, 6); assert.equal((html.match(/main-item-/g) || []).length, 6); assert.match(html, /data-horizontal-slider/); });
test('destinations exposes all supplied countries and keeps only the first ten visible', () => {
  const html = read('src/partials/destinations.html');
  assert.match(html, /<section[^>]+data-destinations[^>]+aria-labelledby="destinations-title"/);
  assert.match(html, /globe-main\.png/);
  assert.equal((html.match(/flags-/g) || []).length, 45);
  assert.equal((html.match(/data-destinations-item/g) || []).length, 45);
  assert.equal((html.match(/data-destinations-extra hidden/g) || []).length, 35);
  for (const country of ['Китай', 'Вьетнам', 'Индия', 'Россия', 'Армения', 'Европа', 'Турция', 'Беларусь', 'Кыргызстан', 'Молдова', 'Южная Корея', 'ОАЭ']) assert.match(html, new RegExp(country));
  assert.match(html, /<button[^>]+data-destinations-toggle[^>]+aria-expanded="false"[^>]+aria-controls="destinations-countries"/);
  assert.match(html, /data-destinations-label>Показать ещё/);
});

test('destinations behavior uses GSAP, accessible labels and reduced-motion fallback', () => {
  const js = read('src/js/components/destinations.js');
  const components = read('src/js/_components.js');
  assert.match(components, /components\/destinations/);
  assert.match(js, /fromTo|gsap\.to/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /aria-expanded/);
  assert.match(js, /Показать ещё/);
  assert.match(js, /Скрыть/);
});
