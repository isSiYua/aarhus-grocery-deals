import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import {
  collectPendingDescriptions,
  DESCRIPTION_SPEC_VERSION,
  descriptionKeyFor,
  emptyDescriptionCache,
  applyDescriptionCacheToOffers,
  resolveProductDescription,
} from '../scripts/lib/product-descriptions.mjs';
import { ITEM_DESCRIPTION_META_PATTERN, sanitizeItemDescriptionZh } from '../scripts/lib/description-quality.mjs';

const classification = { categoryId: 'vegetables', comparisonGroup: 'mushrooms' };

test('description identity is reusable across stores and package sizes', () => {
  const first = descriptionKeyFor({ heading: 'Coop hvide champignoner', storeId: '365' }, classification);
  const second = descriptionKeyFor({ heading: 'COOP HVIDE CHAMPIGNONER', storeId: 'foetex', quantity: 500 }, classification);
  assert.equal(first, second);
});

test('generic market headings do not reuse a different store or week option list', () => {
  const classification = { categoryId: 'alcohol_spirits', comparisonGroup: 'alcohol_spirits' };
  const vodkaGin = descriptionKeyFor({
    heading: 'Spiritusmarked',
    description: 'Absolut Vodka, Beefeater Gin eller Havana Club rom. 70 cl. Frit valg.',
  }, classification);
  const whiskyCognac = descriptionKeyFor({
    heading: 'SPIRITUSMARKED',
    description: 'Gentleman Jack, Jameson eller Martell Cognac. 50-70 cl. Frit valg.',
  }, classification);
  assert.notEqual(vodkaGin, whiskyCognac);
});

test('generic headings still reuse the same option evidence across stores despite price and size noise', () => {
  const classification = { categoryId: 'alcohol_spirits', comparisonGroup: 'alcohol_spirits' };
  const first = descriptionKeyFor({
    heading: 'Spiritusmarked',
    description: 'Absolut Vodka eller Beefeater Gin. 70 cl. Literpris 142,79. Frit valg.',
  }, classification);
  const second = descriptionKeyFor({
    heading: 'SPIRITUSMARKED',
    description: 'Absolut Vodka eller Beefeater Gin. 50 cl. Pr. flaske 99.-',
  }, classification);
  assert.equal(first, second);
});

test('generic image identity is stable from Tjek API input through the published offer', () => {
  const classification = { categoryId: 'leisure_toys', comparisonGroup: 'leisure_toys' };
  const crop = 'https://image-transformer-api.tjek.com/?u=s3%3A%2F%2Fsgn-prd-assets%2Fp-41.webp&w=1000&x1r=0.65&s=abc';
  const fromApi = descriptionKeyFor({
    heading: 'Pudebamse / Bamse',
    description: 'Flere varianter.',
    images: { zoom: crop },
  }, classification);
  const fromPublishedOffer = descriptionKeyFor({
    originalName: 'Pudebamse / Bamse',
    originalDescription: 'Flere varianter.',
    imageUrl: crop,
  }, classification);
  assert.equal(fromApi, fromPublishedOffer);
  assert.match(fromApi, /\|variant-[a-f0-9]{12}$/);
});

test('clothing description identity keeps materially different size ranges separate', () => {
  const classification = { categoryId: 'clothing', comparisonGroup: 'clothing_adult_tops' };
  const standard = descriptionKeyFor({ heading: 'T-shirt', description: 'Str. S-2XL. 100% bomuld.' }, classification);
  const extended = descriptionKeyFor({ heading: 'T-shirt', description: 'Str. S-5XL. 100% bomuld.' }, classification);
  assert.notEqual(standard, extended);
});

test('clothing size identity captures a complete alphanumeric range, not a letter inside prose', () => {
  const classification = { categoryId: 'clothing', comparisonGroup: 'clothing_adult_bottoms' };
  const key = descriptionKeyFor({
    heading: 'Bukser',
    description: 'Normal talje. Wide fit. Normal længde. S-2XL.',
  }, classification);
  assert.match(key, /\|s 2xl$/);
  assert.doesNotMatch(key, /\|l$/);
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
    descriptionSpecVersion: DESCRIPTION_SPEC_VERSION,
  };
  const result = resolveProductDescription(raw, classification, cache);
  assert.equal(result.descriptionSource, 'codex_cache');
  assert.equal(result.descriptionAuthor, 'Codex');
  assert.match(result.zhExplanation, /白蘑菇/);
});

test('stale description reviews are quarantined instead of silently reused', () => {
  const raw = { heading: '10W USB A oplader', description: '1 stk.' };
  const classification = { categoryId: 'electronics', comparisonGroup: 'electronics_computing' };
  const key = descriptionKeyFor(raw, classification);
  const cache = emptyDescriptionCache();
  cache.entries[key] = {
    productNameZh: '数码产品或配件',
    descriptionZh: '旧版空泛说明。',
    descriptionSpecVersion: 'zh-product-v4',
  };
  const resolved = resolveProductDescription(raw, classification, cache);
  assert.equal(resolved.descriptionSource, 'rules_fallback');
  const pending = collectPendingDescriptions([{ ...raw, originalName: raw.heading, originalDescription: raw.description, storeId: 'bilka', ...classification }], cache);
  assert.equal(pending.count, 1);
  assert.equal(pending.items[0].descriptionKey, key);
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

test('shopper-facing descriptions remove internal price-comparison commentary', () => {
  assert.equal(
    sanitizeItemDescriptionZh('火鸡小腿，通常带骨，适合慢烤或炖煮；不与火鸡胸肉比较最低价。'),
    '火鸡小腿，通常带骨，适合慢烤或炖煮。',
  );
  assert.equal(
    sanitizeItemDescriptionZh('丹麦带荚豌豆，需要先剥出豆粒，不能与去壳豌豆按同一可食重量比较。'),
    '丹麦带荚豌豆，需要先剥出豆粒，可食豆粒会少于标示重量。',
  );
});

test('all reusable and published item descriptions contain product facts, not comparison-engine rules', async () => {
  const files = [
    '../data/product_descriptions_zh.json',
    '../data/atlanta_product_knowledge_zh.json',
    '../data/product_review_overrides_zh.json',
    '../data/current_offers.json',
    '../data/atlanta_offers.json',
    '../data/history.json',
  ];
  for (const file of files) {
    const data = JSON.parse(await fs.readFile(new URL(file, import.meta.url), 'utf8'));
    const descriptions = Array.isArray(data)
      ? data.map(offer => offer.zhExplanation)
      : data.entries
        ? Object.values(data.entries).map(entry => entry.descriptionZh)
        : data.offers.map(offer => offer.zhExplanation);
    for (const description of descriptions) {
      assert.doesNotMatch(description || '', ITEM_DESCRIPTION_META_PATTERN, `${file}: ${description}`);
    }
  }
});
