import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const appSource = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');

test('shopping list is local, store-filterable, and keeps completed items recoverable', () => {
  assert.match(appSource, /const SHOPPING_KEY = 'grocery-deals-shopping-v1'/);
  assert.match(appSource, /localStorage\.setItem\(SHOPPING_KEY/);
  assert.match(appSource, /offer\.productKey \|\| offer\.canonicalKey/);
  assert.match(appSource, /\['shopping', '✓'/);
  assert.match(appSource, /还要买/);
  assert.match(appSource, /details', \{ class: 'completed-list'/);
  assert.match(appSource, /storeFilterBar\(allOffers, '只看准备去的商店'\)/);
});

test('global price comparison separates current/upcoming minima and exposes all ties in a modal', () => {
  assert.match(appSource, /candidate\.comparisonGroup === offer\.comparisonGroup/);
  assert.match(appSource, /const isBest = difference <= tolerance/);
  assert.match(appSource, /offerPeriod\(candidate\) === period/);
  assert.match(appSource, /下期新低/);
  assert.match(appSource, /比\$\{periodLabel\}最低贵/);
  assert.match(appSource, /function openLowestModal/);
  assert.match(appSource, /查看 \$\{comparison\.bestOffers\.length\} 个最低商品/);
  assert.match(appSource, /filterOffersByStore\(allOffers\)/);
});

test('home integrates upcoming offers into normal categories instead of recommendation strips', () => {
  assert.doesNotMatch(appSource, /今天值得先看/);
  assert.doesNotMatch(appSource, /下一期可以留意/);
  assert.match(appSource, /本期和下期商品都放进对应分类/);
});
