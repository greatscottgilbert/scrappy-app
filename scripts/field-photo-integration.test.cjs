const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
test('site loads private photo module before the permit UI', () => {
  const html = read('index.html');
  assert.match(html, /<script src="field-observations\.js"><\/script><script src="field-photos\.js"><\/script><script src="app\.js"><\/script>/);
});
test('site tells visitors photos are unencrypted and never shared', () => {
  const html = read('index.html');
  assert.match(html, /unencrypted browser storage/);
  assert.match(html, /never uploaded, shared, or verified/);
});
test('permit UI provides private upload, preview and delete handlers', () => {
  const app = read('app.js');
  for (const marker of ['data-field-photo', 'data-photo-preview', 'data-remove-photo', 'ScrappyFieldPhotos.save', 'ScrappyFieldPhotos.get', 'ScrappyFieldPhotos.remove']) {
    assert.ok(app.includes(marker), 'missing ' + marker);
  }
});
test('photo module has no remote upload, network calls or geolocation', () => {
  const js = read('field-photos.js');
  assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|navigator\.geolocation|sendBeacon\s*\(/);
});
