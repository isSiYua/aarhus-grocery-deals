import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import { parseUpdateStoreIds } from '../scripts/lib/update-scope.mjs';

const stores = ['rema', 'lidl', 'netto'];

test('empty scope means all configured stores', () => {
  assert.deepEqual([...parseUpdateStoreIds('', stores)], stores);
});

test('selected store scope is normalized and deduplicated', () => {
  assert.deepEqual([...parseUpdateStoreIds(' REMA,lidl,rema ', stores)], ['rema', 'lidl']);
});

test('unknown stores fail before any data is changed', () => {
  assert.throws(() => parseUpdateStoreIds('rema,fake', stores), /Unknown store id\(s\): fake/);
});

test('zero-argument update command checks every configured store', async () => {
  const wrapper = await fs.readFile(new URL('../scripts/update-selected-stores.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(wrapper, /Usage: npm run update:stores/);
  assert.match(wrapper, /else delete process\.env\.AARHUS_UPDATE_STORES/);
  assert.match(wrapper, /No material offer changes detected/);
});

test('unchanged identity history does not terminate the enclosing update command', async () => {
  const identityUpdater = await fs.readFile(new URL('../scripts/update-product-identities.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(identityUpdater, /process\.exit\(0\)/);
  assert.match(identityUpdater, /if \(comparablePrevious === comparableNext\)/);
});

test('rotating 365discount catalogue snapshots are unioned without AI calls', async () => {
  const updater = await fs.readFile(new URL('../scripts/update-data.mjs', import.meta.url), 'utf8');
  assert.match(updater, /fetchOfferSnapshots\(dealer\.id, rotatingCatalogueFeed \? 3 : 1\)/);
  assert.match(updater, /rotatingCatalogueFeed = storeId === '365'/);
  assert.match(updater, /raw\.truncated \|\| rotatingCatalogueFeed/);
});
