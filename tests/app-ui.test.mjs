import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const appSource = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');

test('shopping list is local, store-filterable, and keeps completed items recoverable', () => {
  assert.match(appSource, /const SHOPPING_KEY = 'grocery-deals-shopping-v1'/);
  assert.match(appSource, /localStorage\.setItem\(SHOPPING_KEY/);
  assert.match(appSource, /\['shopping', '✓'/);
  assert.match(appSource, /还要买/);
  assert.match(appSource, /details', \{ class: 'completed-list'/);
  assert.match(appSource, /storeFilterBar\(allOffers, '只看准备去的商店'\)/);
});

test('global price comparison highlights every tie and reports the gap after store filtering', () => {
  assert.match(appSource, /candidate\.comparisonGroup === offer\.comparisonGroup/);
  assert.match(appSource, /const isBest = difference <= tolerance/);
  assert.match(appSource, /与全局最低相同/);
  assert.match(appSource, /比全局最低贵/);
  assert.match(appSource, /filterOffersByStore\(allOffers\)/);
});
