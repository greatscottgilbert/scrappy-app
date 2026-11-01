/* Private field observations; not part of municipal permit records or a shared feed. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ScrappyObservations = api;
}(typeof globalThis === 'undefined' ? null : globalThis, function () {
  'use strict';
  const STORAGE_KEY = 'scrappy-field-observations-v1';
  const STAGES = [
    'No action yet', 'Boarded up', 'Fenced off', 'Demolition underway',
    'Excavators on site', 'Cleanup', 'Nothing left'
  ];
  const normalize = value => String(value == null ? '' : value).trim().replace(/\s+/g, ' ');
  const keyFor = row => {
    if (!row || typeof row !== 'object') return null;
    const city = normalize(row.city).toLowerCase();
    const id = normalize(row.permit || row.id).toLowerCase();
    return city && id ? JSON.stringify([city, id]) : null;
  };
  function readAll(storage) {
    try {
      const value = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (_) { return {}; }
  }
  function get(storage, row) {
    const key = keyFor(row);
    if (key) {
      const stored = readAll(storage)[key];
      if (stored && Number.isInteger(stored.stage) && stored.stage >= 0 && stored.stage < STAGES.length &&
          stored.source === 'manual-local' && typeof stored.observedAt === 'string' &&
          Number.isFinite(Date.parse(stored.observedAt))) {
        return {stage: stored.stage, observedAt: stored.observedAt, source: 'manual-local', verified: false};
      }
    }
    // Earlier builds recorded a stage without a timestamp or provenance. Do not silently lose it.
    if (row && Number.isInteger(row.stage) && row.stage > 0 && row.stage < STAGES.length) {
      return {stage: row.stage, observedAt: null, source: 'legacy-unverified', verified: false};
    }
    return null;
  }
  function record(storage, row, stage, timestamp = new Date()) {
    const key = keyFor(row);
    if (!key) throw new Error('A city and stable permit or site ID are required');
    if (!Number.isInteger(stage) || stage < 0 || stage >= STAGES.length) throw new Error('Invalid field stage');
    const observedAt = new Date(timestamp).toISOString();
    const all = readAll(storage);
    all[key] = {stage, observedAt, source: 'manual-local'};
    storage.setItem(STORAGE_KEY, JSON.stringify(all)); // If storage fails, do not pretend it saved.
    return get(storage, row);
  }
  function clear(storage, row) {
    const key = keyFor(row);
    if (!key) throw new Error('A city and stable permit or site ID are required');
    const all = readAll(storage);
    delete all[key];
    storage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
  function showableStage(report) {
    return report && Number.isInteger(report.stage) ? report.stage : null;
  }
  return {STORAGE_KEY, STAGES, keyFor, get, record, clear, showableStage};
}));