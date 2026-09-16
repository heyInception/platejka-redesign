const test = require('node:test');
const assert = require('node:assert/strict');

const { consumePreloaderCookie } = require('../src/js/components/preloader-state.cjs');

test('preloader stores a 24-hour cookie after the first page view', () => {
  let writtenCookie = '';

  assert.equal(consumePreloaderCookie('', (value) => { writtenCookie = value; }), true);
  assert.match(writtenCookie, /^platejka-preloader-viewed=true;/);
  assert.match(writtenCookie, /Max-Age=86400/);
  assert.match(writtenCookie, /Path=\//);
  assert.match(writtenCookie, /SameSite=Lax/);
  assert.equal(consumePreloaderCookie(writtenCookie, () => {}), false);
});

test('preloader still runs when cookies are unavailable', () => {
  assert.equal(consumePreloaderCookie('', () => { throw new Error('blocked'); }), true);
});
