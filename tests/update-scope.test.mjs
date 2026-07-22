import test from 'node:test';
import assert from 'node:assert/strict';

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
