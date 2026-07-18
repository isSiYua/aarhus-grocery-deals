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
  for (const required of ['apples','blueberries','strawberries','watermelon','grapes','cherries','avocado','broccoli','cauliflower','lettuce','spinach','chives','basil','parsley','mixed_fresh_herbs','peas','corn','potatoes_fresh','potato_salad']) {
    assert.ok(groups.has(required), `missing specific produce group ${required}`);
  }
});

test('published fresh herbs are separated by actual species and explain the concrete plant', async () => {
  const data = JSON.parse(await fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'));
  const expected = [
    [/^Purløg$/i, 'chives', /细香葱/],
    [/^Basilikum$/i, 'basil', /罗勒/],
    [/persille eller basilikum/i, 'mixed_fresh_herbs', /欧芹或罗勒/],
    [/persille/i, 'parsley', /欧芹/],
  ];
  for (const [namePattern, group, descriptionPattern] of expected) {
    const matches = data.offers.filter(offer => namePattern.test(offer.originalName));
    assert.ok(matches.length > 0, `missing herb ${namePattern}`);
    for (const offer of matches) {
      if (group === 'parsley' && /eller basilikum/i.test(offer.originalName)) continue;
      assert.equal(offer.comparisonGroup, group, offer.originalName);
      assert.match(offer.zhExplanation, descriptionPattern, offer.originalName);
    }
  }
});
