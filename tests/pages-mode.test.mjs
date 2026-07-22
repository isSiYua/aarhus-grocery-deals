import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test('public site is explicitly in permission-review mode', async () => {
  const config = JSON.parse(await fs.readFile(path.join(root, 'site-mode.json'), 'utf8'));
  assert.equal(config.mode, 'permission-review');
});

test('review demo contains only synthetic content and no third-party media', async () => {
  const demo = JSON.parse(await fs.readFile(path.join(root, 'data/review_demo.json'), 'utf8'));
  assert.equal(demo.metadata.mode, 'permission-review');
  assert.ok(demo.offers.length >= 3);
  assert.ok(demo.offers.every(offer => offer.imageUrl === null));
  assert.ok(demo.offers.every(offer => offer.sourceUrl === null));
  assert.ok(demo.stores.every(store => /虚构/.test(store.name)));
  assert.doesNotMatch(JSON.stringify(demo), /image-transformer-api\.tjek\.com|api\.etilbudsavis\.dk/i);
});

test('Pages workflow deploys the allowlisted build artifact', async () => {
  const workflow = await fs.readFile(path.join(root, '.github/workflows/update-and-deploy.yml'), 'utf8');
  assert.match(workflow, /npm run build:pages/);
  assert.match(workflow, /path: \.pages-dist/);
  assert.match(workflow, /steps\.site_mode\.outputs\.mode == 'live'/);
});
