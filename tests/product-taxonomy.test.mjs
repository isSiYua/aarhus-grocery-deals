import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import { resolveProductTaxonomy } from '../scripts/lib/product-taxonomy.mjs';

test('fixed Codex taxonomy overrides the fallback without changing stable identity', () => {
  const taxonomy = {
    entries: {
      'v1|citronella lys|fruit_other': {
        categoryId: 'household',
        comparisonGroup: 'home_goods',
        reviewStatus: 'reviewed',
        labelZh: '家居用品',
        reasonZh: '蜡烛不是水果',
      },
    },
  };
  assert.deepEqual(resolveProductTaxonomy('v1|citronella lys|fruit_other', { categoryId: 'fruit', comparisonGroup: 'fruit_other' }, taxonomy), {
    categoryId: 'household',
    comparisonGroup: 'home_goods',
    taxonomySource: 'codex_taxonomy',
    taxonomyReviewStatus: 'reviewed',
    taxonomyLabelZh: '家居用品',
    taxonomyReasonZh: '蜡烛不是水果',
  });
});

test('published fruit and vegetables contain only produce and use specific species groups', async () => {
  const data = JSON.parse(await fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'));
  const produce = data.offers.filter(offer => ['fruit','vegetables'].includes(offer.categoryId));
  const names = produce.map(offer => offer.originalName).join(' | ');
  assert.doesNotMatch(names, /citronella|\blys\b|rosé|chokobanan|salatost|tomatkniv|majskylling|hvidløgsflutes|long ribs|tomatkonserves/i);
  const groups = new Set(produce.map(offer => offer.comparisonGroup));
  for (const required of ['apples','blueberries','strawberries','watermelon','grapes','cherries','avocado','broccoli','cauliflower','lettuce','spinach','fresh_herbs','peas','corn','potatoes_fresh','potato_salad']) {
    assert.ok(groups.has(required), `missing specific produce group ${required}`);
  }
});
