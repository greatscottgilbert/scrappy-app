/* Private, unverified field photos: re-encoded on device and stored only in IndexedDB.
 * No network, GPS, cloud synchronization or external image processor is used here.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ScrappyFieldPhotos = api;
}(typeof globalThis === 'undefined' ? null : globalThis, function () {
  'use strict';
  const DB_NAME = 'scrappy-private-field-photos-v1';
  const STORE = 'photos';
  const MAX_INPUT_BYTES = 12 * 1024 * 1024;
  const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
  const MAX_EDGE = 1280;
  const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const normalize = x => String(x == null ? '' : x).trim().replace(/\s+/g, ' ');
  const keyFor = row => {
    if (!row || typeof row !== 'object') return null;
    const city = normalize(row.city).toLowerCase();
    const identifier = normalize(row.permit || row.id).toLowerCase();
    return city && identifier ? JSON.stringify([city, identifier]) : null;
  };
  function validateFile(file) {
    if (!file || !ALLOWED.has(file.type)) throw new Error('Choose a JPEG, PNG or WebP photo.');
    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_INPUT_BYTES) {
      throw new Error('Photo must be nonempty and at most 12 MB.');
    }
  }
  async function reencode(file, adapters = {}) {
    validateFile(file);
    const decoder = adapters.decode || (typeof createImageBitmap === 'function' ? createImageBitmap : null);
    const createCanvas = adapters.canvas || (typeof document !== 'undefined' ? () => document.createElement('canvas') : null);
    if (!decoder || !createCanvas) throw new Error('Local photo processing is unavailable in this browser.');
    let bitmap;
    try {
      bitmap = await decoder(file);
      if (!bitmap || !(bitmap.width > 0 && bitmap.height > 0)) throw new Error('Invalid image dimensions.');
      const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
      const canvas = createCanvas();
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context || typeof canvas.toBlob !== 'function') throw new Error('Photo canvas is unavailable.');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(result => result ? resolve(result) : reject(new Error('Photo encoding failed.')), 'image/jpeg', 0.78);
      });
      if (blob.type !== 'image/jpeg' || blob.size <= 0 || blob.size > MAX_OUTPUT_BYTES) {
        throw new Error('Encoded photo is too large or unsupported.');
      }
      return blob;
    } finally {
      if (bitmap && typeof bitmap.close === 'function') bitmap.close();
    }
  }
  function openDB(indexedDBFactory) {
    const provider = indexedDBFactory === undefined ? (typeof indexedDB === 'undefined' ? null : indexedDB) : indexedDBFactory;
    if (!provider) return Promise.reject(new Error('Private photo storage is unavailable (IndexedDB denied).'));
    return new Promise((resolve, reject) => {
      let request;
      try { request = provider.open(DB_NAME, 1); }
      catch (error) { reject(error); return; }
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Photo database could not open.'));
      request.onblocked = () => reject(new Error('Photo database is blocked by another tab.'));
    });
  }
  async function transaction(mode, operation, indexedDBFactory) {
    const db = await openDB(indexedDBFactory);
    try {
      return await new Promise((resolve, reject) => {
        let tx;
        try { tx = db.transaction(STORE, mode); }
        catch (error) { reject(error); return; }
        let result;
        tx.onerror = () => reject(tx.error || new Error('Photo storage transaction failed.'));
        tx.onabort = () => reject(tx.error || new Error('Photo storage transaction was interrupted.'));
        tx.oncomplete = () => resolve(result);
        try {
          const request = operation(tx.objectStore(STORE));
          request.onsuccess = () => { result = request.result; };
          request.onerror = () => reject(request.error || new Error('Photo storage request failed.'));
        } catch (error) { reject(error); }
      });
    } finally { db.close(); }
  }
  async function save(row, file, options = {}) {
    const key = keyFor(row);
    if (!key) throw new Error('A city and stable permit or site ID are required.');
    const blob = await reencode(file, options);
    const item = {blob, source: 'private-device', verified: false, savedAt: new Date().toISOString()};
    await transaction('readwrite', store => store.put(item, key), options.indexedDB);
    return {savedAt: item.savedAt, size: blob.size, verified: false};
  }
  async function get(row, options = {}) {
    const key = keyFor(row);
    if (!key) return null;
    const item = await transaction('readonly', store => store.get(key), options.indexedDB);
    if (!item || !item.blob || item.blob.type !== 'image/jpeg' || !(item.blob.size > 0)) return null;
    return {blob: item.blob, savedAt: item.savedAt, source: 'private-device', verified: false};
  }
  async function remove(row, options = {}) {
    const key = keyFor(row);
    if (!key) throw new Error('A city and stable permit or site ID are required.');
    await transaction('readwrite', store => store.delete(key), options.indexedDB);
  }
  return {DB_NAME, STORE, MAX_INPUT_BYTES, MAX_OUTPUT_BYTES, MAX_EDGE, keyFor, validateFile, reencode, save, get, remove};
}));
