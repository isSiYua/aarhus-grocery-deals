import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('published data contains no private home-base fields or home wording', async () => {
  const data = JSON.parse(await fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'));

  assert.equal(Object.hasOwn(data.metadata, 'addressLabel'), false);
  for (const store of data.stores) {
    assert.doesNotMatch(store.descriptionZh, /住址|住宅|家庭地址/);
    assert.doesNotMatch(store.mapUrl, /\bnear\b/i);
  }
});
