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
    categoryId: 'household_paper',
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
  // Verify every produce offer uses a specific species-level group — no generic fallback like "vegetable" or "fruit"
  const genericGroups = new Set(['vegetables_without_group', 'fruit_without_group', 'vegetables', 'fruit']);
  for (const offer of produce) {
    assert.ok(!genericGroups.has(offer.comparisonGroup), `${offer.originalName} uses generic group ${offer.comparisonGroup} instead of a specific species group`);
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
  let anyHerbPresent = false;
  for (const [namePattern, group, descriptionPattern] of expected) {
    const matches = data.offers.filter(offer => namePattern.test(offer.originalName));
    if (matches.length === 0) continue; // not in this week's data — skip
    anyHerbPresent = true;
    for (const offer of matches) {
      if (group === 'parsley' && /eller basilikum/i.test(offer.originalName)) continue;
      assert.equal(offer.comparisonGroup, group, offer.originalName);
      assert.match(offer.zhExplanation, descriptionPattern, offer.originalName);
    }
  }
  // At least one known herb pattern should be present; otherwise data may have drifted
  assert.ok(anyHerbPresent, 'no known herb products found in current offers — verify data sources');
});

test('every published product has a repository-backed Chinese product name and no template fallback', async () => {
  const data = JSON.parse(await fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'));
  const pending = JSON.parse(await fs.readFile(new URL('../data/product_descriptions_pending.json', import.meta.url), 'utf8'));
  const publishedKeys = new Set(data.offers.map(offer => offer.descriptionKey));
  for (const item of pending.items) assert.equal(publishedKeys.has(item.descriptionKey), false, item.originalName);
  assert.ok(data.metadata.contentUpdatedAt);
  for (const offer of data.offers) {
    assert.ok(offer.productNameZh, offer.originalName);
    assert.equal(offer.descriptionSource, 'codex_cache', offer.originalName);
  }

  const expected = new Map([
    ['Kyllingepopcorn', ['爆米花鸡块（裹粉小鸡块）', 'prepared_chicken_breaded', /甜辣蘸酱/]],
    ['Morliny classic eller crispy hot wings', ['Morliny 原味热辣或裹粉脆皮鸡翅', 'prepared_chicken_wings_mixed_offer', /烤箱或空气炸锅复热/]],
    ['Galle & Jessen pålægschokolade*', ['面包用薄片巧克力', 'chocolate', /不是肉类冷切/]],
    ['Torsdagssmørrebrød', ['丹麦开放式三明治', 'ready_meal', /开放式三明治/]],
    ['Kalkunbrystfilet', ['火鸡胸肉', 'turkey_breast', /不是鸡胸肉/]],
    ['Kalkununderlår', ['火鸡小腿', 'turkey_thigh', /慢烤、炖煮或红烧/]],
  ]);
  for (const [originalName, [productNameZh, comparisonGroup, descriptionPattern]] of expected) {
    const offer = data.offers.find(item => item.originalName === originalName);
    assert.ok(offer, originalName);
    assert.equal(offer.productNameZh, productNameZh);
    assert.equal(offer.comparisonGroup, comparisonGroup);
    assert.match(offer.zhExplanation, descriptionPattern);
  }
});

test('published comparison pools never mix turkey breasts with turkey legs or mixed offers', async () => {
  const data = JSON.parse(await fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'));
  const turkeyBreasts = data.offers.filter(offer => /kalkunbryst|kalkunschnitz|kalkunstrimler/i.test(offer.originalName) && !/overlår/i.test(offer.originalName));
  const turkeyLegs = data.offers.filter(offer => /kalkununderlår|kalkunoverlår/i.test(offer.originalName) && !/schnitzel/i.test(offer.originalName));
  assert.ok(turkeyBreasts.length > 0);
  assert.ok(turkeyLegs.length > 0);
  for (const offer of turkeyBreasts) {
    assert.equal(offer.comparisonGroup, 'turkey_breast', offer.originalName);
    assert.doesNotMatch(offer.productNameZh, /^鸡胸肉/);
  }
  for (const offer of turkeyLegs) assert.equal(offer.comparisonGroup, 'turkey_thigh', offer.originalName);
  assert.notEqual(turkeyBreasts[0].comparisonGroup, turkeyLegs[0].comparisonGroup);
  for (const offer of data.offers) {
    if (/mixed|_offer$/.test(offer.comparisonGroup)) assert.equal(data.comparisonGroups[offer.comparisonGroup].comparable, false, offer.originalName);
  }
});

test('published fine taxonomy keeps mince, yoghurt, cold dairy, and cheese forms separated', async () => {
  const [aarhus, atlanta] = await Promise.all([
    fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8').then(JSON.parse),
    fs.readFile(new URL('../data/atlanta_offers.json', import.meta.url), 'utf8').then(JSON.parse),
  ]);

  const aarhusMince = new Set(['chicken_minced', 'turkey_minced', 'pork_minced', 'beef_minced', 'mixed_minced']);
  for (const offer of aarhus.offers) {
    if (aarhusMince.has(offer.comparisonGroup)) assert.equal(offer.categoryId, 'minced_meat', offer.originalName);
    if (offer.comparisonGroup === 'yoghurt') assert.equal(offer.categoryId, 'yoghurt', offer.originalName);
    if (['cream', 'mixed_dairy'].includes(offer.comparisonGroup)) assert.equal(offer.categoryId, 'cream_cold_dairy', offer.originalName);
    if (offer.comparisonGroup.startsWith('cheese_')) assert.equal(offer.categoryId, 'cheese', offer.originalName);
  }
  const aarhusCheeseGroups = new Set(aarhus.offers.filter(offer => offer.categoryId === 'cheese').map(offer => offer.comparisonGroup));
  assert.ok(aarhusCheeseGroups.size >= 10);
  assert.equal(aarhusCheeseGroups.has('cheese'), false);
  assert.equal(aarhusCheeseGroups.has('cheese_fresh'), false);

  const atlantaMince = new Set(['meat_ground_beef', 'meat_ground_chicken', 'meat_ground_pork']);
  for (const offer of atlanta.offers) {
    if (atlantaMince.has(offer.comparisonGroup)) assert.equal(offer.categoryId, 'minced_meat', offer.originalName);
    if (offer.comparisonGroup === 'dairy_yogurt') assert.equal(offer.categoryId, 'yoghurt', offer.originalName);
    if (offer.comparisonGroup.startsWith('cheese_')) assert.equal(offer.categoryId, 'cheese', offer.originalName);
  }
  const atlantaCheeseGroups = new Set(atlanta.offers.filter(offer => offer.categoryId === 'cheese').map(offer => offer.comparisonGroup));
  const allowedAtlantaCheeseGroups = new Set(['cheese_grated', 'cheese_portioned', 'cheese_prepared', 'cheese_sliced', 'cheese_spreadable', 'cheese_table']);
  for (const group of atlantaCheeseGroups) assert.equal(allowedAtlantaCheeseGroups.has(group), true, group);
  assert.equal(atlantaCheeseGroups.has('cheese_table'), true);
  assert.equal(atlantaCheeseGroups.has('cheese_grated'), true);
  for (const offer of atlanta.offers.filter(offer => offer.categoryId === 'cheese')) {
    assert.doesNotMatch(offer.originalName, /cheez-it|crackers?/i, offer.originalName);
    if (/cream cheese|spread/i.test(offer.originalName)) assert.equal(offer.comparisonGroup, 'cheese_spreadable', offer.originalName);
  }
});
