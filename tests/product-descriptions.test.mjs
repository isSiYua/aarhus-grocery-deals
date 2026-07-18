import test from 'node:test';
import assert from 'node:assert/strict';

import {
  collectPendingDescriptions,
  descriptionKeyFor,
  emptyDescriptionCache,
  resolveProductDescription,
} from '../scripts/lib/product-descriptions.mjs';
import { responseOutputText, validateGeneratedBatch } from '../scripts/lib/openai-description-client.mjs';

const classification = { categoryId: 'vegetables', comparisonGroup: 'mushrooms' };

test('description identity is reusable across stores and package sizes', () => {
  const first = descriptionKeyFor({ heading: 'Coop hvide champignoner', storeId: '365' }, classification);
  const second = descriptionKeyFor({ heading: 'COOP HVIDE CHAMPIGNONER', storeId: 'foetex', quantity: 500 }, classification);
  assert.equal(first, second);
});

test('AI cache overrides the rule fallback and records provenance', () => {
  const raw = { heading: 'Coop hvide champignoner', description: '350 g' };
  const key = descriptionKeyFor(raw, classification);
  const cache = emptyDescriptionCache();
  cache.entries[key] = {
    descriptionZh: '白蘑菇，也叫口蘑，适合切片炒肉、煮汤或做奶油炖菜；与中国超市常见白色口蘑基本相同。',
    model: 'test-model',
    promptVersion: 'test-prompt',
  };
  const result = resolveProductDescription(raw, classification, cache);
  assert.equal(result.descriptionSource, 'ai_cache');
  assert.equal(result.descriptionModel, 'test-model');
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

test('structured model output must contain every requested key exactly once', () => {
  const expected = [{ descriptionKey: 'v1|a|fruit_other' }, { descriptionKey: 'v1|b|fruit_other' }];
  const parsed = {
    descriptions: [
      { descriptionKey: 'v1|a|fruit_other', descriptionZh: '这是第一种水果，通常可以直接食用；具体品种、成熟度和甜度请按原名及包装确认。' },
      { descriptionKey: 'v1|b|fruit_other', descriptionZh: '这是第二种水果，可直接食用或搭配酸奶；若包装包含多个品种，应以实际选择为准。' },
    ],
  };
  assert.equal(validateGeneratedBatch(parsed, expected).size, 2);
  assert.throws(() => validateGeneratedBatch({ descriptions: parsed.descriptions.slice(0, 1) }, expected), /omitted/);
  assert.equal(responseOutputText({ output: [{ content: [{ type: 'output_text', text: '{"ok":true}' }] }] }), '{"ok":true}');
});
