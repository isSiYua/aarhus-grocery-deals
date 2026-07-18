import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('service worker refreshes online resources and immediately activates updates', async () => {
  const source = await fs.readFile(new URL('../sw.js', import.meta.url), 'utf8');
  const html = await fs.readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(source, /await fetch\(request\)/);
  assert.match(source, /await caches\.match\(request\)/);
  assert.match(source, /self\.skipWaiting\(\)/);
  assert.match(source, /self\.clients\.claim\(\)/);
  assert.match(source, /aarhus-grocery-v19/);
  assert.match(source, /styles\.css\?v=19/);
  assert.match(source, /app\.js\?v=19/);
  assert.match(html, /styles\.css\?v=19/);
  assert.match(html, /app\.js\?v=19/);
});
