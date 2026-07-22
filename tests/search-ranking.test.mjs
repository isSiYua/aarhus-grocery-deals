import test from 'node:test';
import assert from 'node:assert/strict';

import { offerSearchScore } from '../search-ranking.js';

test('actual product identity ranks ahead of incidental serving suggestions', () => {
  const egg = offerSearchScore({
    productNameZh: '平养鸡蛋',
    originalName: 'Skrabeæg M/L',
    zhExplanation: '鸡蛋，可煮、煎或用于烘焙。',
  }, '鸡蛋', { comparisonGroupName: '鸡蛋' });
  const bacon = offerSearchScore({
    productNameZh: '早餐小香肠或培根片任选',
    originalName: 'Brunchpølser eller bacon',
    zhExplanation: '适合煎熟后配鸡蛋和面包。',
  }, '鸡蛋', { comparisonGroupName: '香肠' });

  assert.ok(egg > bacon);
  assert.equal(bacon, 120);
});

test('store names and original Danish names remain searchable', () => {
  const offer = { productNameZh: '平养鸡蛋', originalName: 'Skrabeæg M/L' };
  assert.ok(offerSearchScore(offer, 'skrabeæg') >= 1000);
  assert.ok(offerSearchScore(offer, 'Netto', { storeName: 'Netto' }) >= 600);
});
