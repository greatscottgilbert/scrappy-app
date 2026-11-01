const test = require('node:test');
const assert = require('node:assert/strict');
const photos = require('../field-photos.js');
const observation = require('../field-observations.js');
const row = {city: 'Vancouver', permit: 'A-123', id: 'feed-2'};
const sample = {type: 'image/png', size: 1000};
function adapters(options = {}) {
  const events = {closed: false, drawn: null, size: null, mime: null};
  return {
    events,
    decode: async () => ({width: options.width || 2400, height: options.height || 1200, close: () => {events.closed = true;}}),
    canvas: () => ({width: 0, height: 0, getContext() {
      return {drawImage(_bmp, _x, _y, width, height) {events.drawn = {width, height};}};
    }, toBlob(callback, mime) {
      events.mime = mime;
      callback(new Blob([new Uint8Array(options.bytes || 128)], {type: options.mime || 'image/jpeg'}));
    }})
  };
}
function fakeIDB() {
  const records = new Map();
  let closed = 0;
  return {records, get closed() {return closed;}, open() {
    const req = {result: {
      objectStoreNames: {contains: () => true},
      createObjectStore() {throw new Error('unexpected upgrade');},
      close() {closed++;},
      transaction() {
        const tx = {oncomplete: null, onerror: null, onabort: null, objectStore() {
          return {
            put(value, key) {return run(() => records.set(key, value));},
            get(key) {return run(() => records.get(key));},
            delete(key) {return run(() => records.delete(key));}
          };
        }};
        function run(work) {
          const r = {result: undefined, onsuccess: null, onerror: null};
          queueMicrotask(() => {
            r.result = work();
            if (r.onsuccess) r.onsuccess();
            queueMicrotask(() => {if (tx.oncomplete) tx.oncomplete();});
          });
          return r;
        }
        return tx;
      }
    }, onsuccess: null, onerror: null};
    queueMicrotask(() => req.onsuccess());
    return req;
  }};
}
test('photo identity equals private field-status identity', () => assert.equal(photos.keyFor(row), observation.keyFor(row)));
test('stable permit survives feed ID refresh and city remains isolated', () => {
  assert.equal(photos.keyFor({...row, id: 'changed'}), photos.keyFor(row));
  assert.notEqual(photos.keyFor({...row, city: 'New Westminster'}), photos.keyFor(row));
});
test('missing stable ID is rejected', () => assert.equal(photos.keyFor({city: 'Vancouver'}), null));
test('untrusted formats and missing files are rejected without decoding', () => {
  assert.throws(() => photos.validateFile({type: 'image/svg+xml', size: 1000}), /JPEG/);
  assert.throws(() => photos.validateFile(null), /JPEG/);
});
test('zero-byte and excessive files are rejected', () => {
  assert.throws(() => photos.validateFile({type: 'image/jpeg', size: 0}), /12 MB/);
  assert.throws(() => photos.validateFile({type: 'image/jpeg', size: photos.MAX_INPUT_BYTES+1}), /12 MB/);
});
test('photo is resized and re-encoded as JPEG on device', async () => {
  const adapter = adapters();
  const blob = await photos.reencode(sample, adapter);
  assert.equal(blob.type, 'image/jpeg');
  assert.equal(adapter.events.mime, 'image/jpeg');
  assert.deepEqual(adapter.events.drawn, {width: 1280, height: 640});
  assert.equal(adapter.events.closed, true);
});
test('small images are not upscaled', async () => {
  const a = adapters({width: 200, height: 100});
  await photos.reencode(sample, a);
  assert.deepEqual(a.events.drawn, {width: 200, height: 100});
});
test('unavailable browser decoder produces an explicit error', async () => {
  await assert.rejects(photos.reencode(sample, {decode: null, canvas: () => ({})}), /unavailable/);
});
test('oversize encoded photos are rejected and bitmap is closed', async () => {
  const a = adapters({bytes: photos.MAX_OUTPUT_BYTES+1});
  await assert.rejects(photos.reencode(sample, a), /too large/);
  assert.equal(a.events.closed, true);
});
test('unsupported canvas output cannot be silently saved', async () => {
  await assert.rejects(photos.reencode(sample, adapters({mime: 'image/png'})), /unsupported/);
});
test('no IndexedDB rejects save without claiming success', async () => {
  await assert.rejects(photos.save(row, sample, {...adapters(), indexedDB: null}), /IndexedDB denied/);
});
test('save/read/delete are private, not verified, and municipality-scoped', async () => {
  const idb = fakeIDB();
  await photos.save(row, sample, {...adapters(), indexedDB: idb});
  assert.equal((await photos.get(row, {indexedDB: idb})).verified, false);
  assert.equal(await photos.get({...row, city: 'New Westminster'}, {indexedDB: idb}), null);
  await photos.remove(row, {indexedDB: idb});
  assert.equal(await photos.get(row, {indexedDB: idb}), null);
  assert.equal(idb.closed, 5);
});
test('stored forged verified bit cannot confer verified status', async () => {
  const idb = fakeIDB();
  idb.records.set(photos.keyFor(row), {blob: new Blob([1], {type: 'image/jpeg'}), verified: true, savedAt: '2026-11-01'});
  assert.equal((await photos.get(row, {indexedDB: idb})).verified, false);
});
