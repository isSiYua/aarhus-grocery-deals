import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('service worker refreshes online resources and immediately activates updates', async () => {
  const source = await fs.readFile(new URL('../sw.js', import.meta.url), 'utf8');
  const html = await fs.readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(source, /await fetch\(request, \{ cache: 'no-store' \}\)/);
  assert.match(source, /await caches\.match\(cacheKey\)/);
  assert.match(source, /self\.skipWaiting\(\)/);
  assert.match(source, /self\.clients\.claim\(\)/);
  assert.match(source, /cacheKeyFor\(request\)/);
  assert.match(source, /data\/current_offers\.json/);
  assert.match(source, /APP_UPDATED/);
  const version = source.match(/aarhus-grocery-v(\d+)/)?.[1];
  assert.ok(version, 'service worker cache must have a numeric version');
  assert.match(source, new RegExp(`styles\\.css\\?v=${version}`));
  assert.match(source, new RegExp(`app\\.js\\?v=${version}`));
  assert.match(html, new RegExp(`styles\\.css\\?v=${version}`));
  assert.match(html, new RegExp(`app\\.js\\?v=${version}`));
});
