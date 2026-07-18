import test from 'node:test';
import assert from 'node:assert/strict';

import {
  collectPendingDescriptions,
  descriptionKeyFor,
  emptyDescriptionCache,
  applyDescriptionCacheToOffers,
  resolveProductDescription,
} from '../scripts/lib/product-descriptions.mjs';

const classification = { categoryId: 'vegetables', comparisonGroup: 'mushrooms' };

test('description identity is reusable across stores and package sizes', () => {
  const first = descriptionKeyFor({ heading: 'Coop hvide champignoner', storeId: '365' }, classification);
  const second = descriptionKeyFor({ heading: 'COOP HVIDE CHAMPIGNONER', storeId: 'foetex', quantity: 500 }, classification);
  assert.equal(first, second);
});

test('taxonomy changes refresh stale fallback descriptions instead of retaining generic vegetable text', () => {
  const offers = [{
    originalName: 'Danske løse ærter',
    originalDescription: '100 g',
    categoryId: 'vegetables',
    comparisonGroup: 'peas',
    zhExplanation: '蔬菜商品，可用于清炒、炖煮、烤制或配菜；具体品种以原名为准。',
    descriptionSource: 'rules_fallback',
  }];
  const result = applyDescriptionCacheToOffers(offers, emptyDescriptionCache());
  assert.match(result.offers[0].zhExplanation, /丹麦新鲜豌豆/);
  assert.doesNotMatch(result.offers[0].zhExplanation, /具体品种以原名为准/);
  assert.equal(result.applied, 1);
});

test('a named carrot offer explains the actual vegetable rather than the parent category', () => {
  const result = resolveProductDescription(
    { heading: 'Gulerødder med top', description: 'Økologiske danske' },
    { categoryId: 'vegetables', comparisonGroup: 'root_vegetables' },
  );
  assert.match(result.zhExplanation, /带叶胡萝卜/);
  assert.doesNotMatch(result.zhExplanation, /^蔬菜商品/);
});

test('Codex cache overrides the rule fallback and records provenance', () => {
  const raw = { heading: 'Coop hvide champignoner', description: '350 g' };
  const key = descriptionKeyFor(raw, classification);
  const cache = emptyDescriptionCache();
  cache.entries[key] = {
    descriptionZh: '白蘑菇，也叫口蘑，适合切片炒肉、煮汤或做奶油炖菜；与中国超市常见白色口蘑基本相同。',
    authoredBy: 'Codex',
    descriptionSpecVersion: 'test-spec',
  };
  const result = resolveProductDescription(raw, classification, cache);
  assert.equal(result.descriptionSource, 'codex_cache');
  assert.equal(result.descriptionAuthor, 'Codex');
  assert.match(result.zhExplanation, /白蘑菇/);
});

test('pending queue deduplicates the same product while retaining occurrence evidence', () => {
  const offers = [
    { originalName: 'Coop hvide champignoner', originalDescription: '350 g', storeId: '365', ...classification },
    { originalName: 'Coop hvide champignoner', originalDescription: '500 g', storeId: 'foetex', ...classification },
  ];
  const pending = collectPendingDescriptions(offers, emptyDescriptionCache(), '2026-07-18T00:00:00Z');
  assert.equal(pending.count, 1);
  assert.equal(pending.items[0].occurrences, 2);
  assert.deepEqual(pending.items[0].stores, ['365', 'foetex']);
});
