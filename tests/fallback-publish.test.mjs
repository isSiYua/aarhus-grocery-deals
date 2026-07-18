import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isReviewedAarhusOffer,
  isReviewedAtlantaOffer,
  retainReviewedOffers,
} from '../scripts/lib/fallback-publish.mjs';

test('fallback publishes reviewed cached products and withholds unseen Aarhus products', () => {
  const taxonomy = {
    entries: {
      known: { reviewStatus: 'reviewed', status: 'active' },
      unseen: { reviewStatus: 'pending_codex_review', status: 'active' },
    },
  };
  const offers = [
    { id: 'known', descriptionKey: 'known', descriptionSource: 'codex_cache', taxonomyReviewStatus: 'reviewed' },
    { id: 'unseen', descriptionKey: 'unseen', descriptionSource: 'rules_fallback', taxonomyReviewStatus: 'unreviewed' },
  ];

  const result = retainReviewedOffers(offers, offer => isReviewedAarhusOffer(offer, taxonomy));
  assert.deepEqual(result.retained.map(offer => offer.id), ['known']);
  assert.deepEqual(result.withheld.map(offer => offer.id), ['unseen']);
});

test('fallback does not publish automatically generated Atlanta descriptions', () => {
  const knowledge = {
    entries: {
      known: { reviewStatus: 'codex_name_and_description_reviewed', productNameZh: '鸡胸肉', descriptionZh: '鸡胸肉。' },
      unseen: { reviewStatus: 'name_reviewed_image_pending', productNameZh: '肉类', descriptionZh: '肉类商品。' },
    },
  };
  const known = { productKnowledgeKey: 'known', descriptionSource: 'codex_product_knowledge' };
  const unseen = { productKnowledgeKey: 'unseen', descriptionSource: 'codex_product_knowledge' };

  assert.equal(isReviewedAtlantaOffer(known, knowledge), true);
  assert.equal(isReviewedAtlantaOffer(unseen, knowledge), false);
});
