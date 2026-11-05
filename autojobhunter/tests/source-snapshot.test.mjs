import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const index = read('web/index.html');
const worker = read('src/deployed-worker-2026-11-03.js');
const manifest = JSON.parse(read('web/manifest.webmanifest'));

test('app HTML is present and clearly branded', () => {
  assert.match(index, /<html/i);
  assert.match(index, /AutoJobHunter/i);
});

test('PWA manifest has install metadata and local icon', () => {
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.ok(manifest.icons.some(i => i.src === 'icon.svg'));
  assert.match(read('web/icon.svg'), /<svg/);
});

test('service worker and its cache syntax compile', () => {
  new Script(read('web/sw.js'), { filename: 'sw.js' });
  assert.match(read('web/sw.js'), /addEventListener\('fetch'/);
});

test('deployed Worker syntax compiles (does not execute)', () => {
  new Script(worker, { filename: 'deployed-worker-2026-11-03.js' });
});

test('extracted assets match deployment snapshot exactly', () => {
  const marker = '};addEventListener(';
  const end = worker.lastIndexOf(marker);
  assert.ok(end > 0, 'packed ASSETS section not found');
  const assets = JSON.parse(worker.slice('const ASSETS='.length, end + 1));
  for (const [remote, local] of [
    ['/beta/index.html', 'web/index.html'],
    ['/beta/icon.svg', 'web/icon.svg'],
    ['/beta/manifest.webmanifest', 'web/manifest.webmanifest'],
    ['/beta/sw.js', 'web/sw.js'],
    ['/beta/reviewer-guide.txt', 'web/reviewer-guide.txt']
  ]) {
    assert.equal(read(local), assets[remote]?.[0], remote + ' differs from snapshot');
  }
});

test('reviewer guide does not falsely claim an Android APK or auto-submission', () => {
  const guide = read('web/reviewer-guide.txt');
  assert.match(guide, /NOT an APK/i);
  assert.match(guide, /Nothing is sent automatically/i);
});
