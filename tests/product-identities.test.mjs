import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('stable product history separates product identity from promotion source IDs', async () => {
  const [data, history] = await Promise.all([
    fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8').then(JSON.parse),
    fs.readFile(new URL('../data/product_identity_history.json', import.meta.url), 'utf8').then(JSON.parse),
  ]);
  for (const offer of data.offers) {
    const product = history.products[offer.descriptionKey];
    assert.ok(product, `missing stable identity for ${offer.descriptionKey}`);
    assert.equal(product.stableProductKey, offer.descriptionKey);
    assert.ok(product.offerIds[offer.sourceOfferId || offer.canonicalKey], `missing source offer ID for ${offer.canonicalKey}`);
  }
  for (const product of Object.values(history.products)) {
    const sources = Object.values(product.offerIds);
    assert.equal(product.evidence.distinctSourceOfferIdCount, sources.length);
    assert.equal(product.evidence.sameNameSeenWithDifferentSourceIds, sources.length > 1);
    for (const sourceId of product.evidence.repeatedSourceIdsAcrossPromotionPeriods) {
      assert.ok(product.offerIds[sourceId].validPeriods.length > 1);
    }
    for (const image of product.evidence.exactImageReferencesSharedAcrossSourceIds) {
      assert.ok(product.imageReferences[image.reference].offerIds.length > 1);
    }
  }
});
