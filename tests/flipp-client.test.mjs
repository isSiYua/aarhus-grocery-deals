import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chooseCurrentFlyer,
  fetchFlyerItems,
  fetchFlyers,
  classifyFlippItem,
  normalizeFlippItems,
} from '../scripts/lib/flipp-client.mjs';

test('loads the postal-code flyer directory and validates its shape', async () => {
  const calls = [];
  const flyers = await fetchFlyers('30318', async (path, params) => {
    calls.push({ path, params });
    return { flyers: [{ id: 1, merchant: 'Kroger', name: 'Weekly Ad' }] };
  });
  assert.equal(flyers.length, 1);
  assert.deepEqual(calls, [{ path: '/flyers', params: { postal_code: '30318' } }]);
});

test('selects only the currently active exact merchant flyer', () => {
  const now = new Date('2026-07-18T12:00:00-04:00');
  const flyers = [
    { id: 1, merchant: 'Publix', name: 'Anuncio Semanal Español', valid_from: '2026-07-15T00:00:00-04:00', valid_to: '2026-07-21T23:59:59-04:00' },
    { id: 2, merchant: 'Publix', name: 'Weekly Ad', valid_from: '2026-07-15T00:00:00-04:00', valid_to: '2026-07-21T23:59:59-04:00' },
    { id: 3, merchant: 'Publix', name: 'Weekly Ad', valid_from: '2026-07-22T00:00:00-04:00', valid_to: '2026-07-28T23:59:59-04:00' },
  ];
  const selected = chooseCurrentFlyer(flyers, { merchant: 'Publix', flyerNames: ['Weekly Ad'] }, now);
  assert.equal(selected.id, 2);
});

test('loads flyer items and validates its shape', async () => {
  const items = await fetchFlyerItems(123, '30318', async (path, params) => {
    assert.equal(path, '/flyers/123');
    assert.deepEqual(params, { postal_code: '30318' });
    return { items: [{ id: 5 }] };
  });
  assert.equal(items[0].id, 5);
});

test('classifies grocery names before ambiguous words', () => {
  assert.equal(classifyFlippItem('Kroger Whole or Baby Bella Mushrooms').categoryId, 'produce');
  assert.equal(classifyFlippItem('Pringles Potato Crisps').categoryId, 'snacks');
  assert.equal(classifyFlippItem('Breyers Ice Cream').categoryId, 'frozen');
  assert.equal(classifyFlippItem('Tyson Frozen Chicken').categoryId, 'meat');
  assert.equal(classifyFlippItem('Apple Pie').categoryId, 'bakery');
});

test('normalizes real priced groceries, removes duplicates, and uses the exact flyer instead of a generic retailer campaign', () => {
  const flyer = { id: 123, name: 'Weekly Ad', valid_from: '2026-07-15', valid_to: '2026-07-21' };
  const items = [
    { id: 1, display_type: 1, name: 'Tyson Frozen Chicken', price: '6.99', valid_from: '2026-07-15', valid_to: '2026-07-21', ttm_url: 'http://retailer.example/item/1' },
    { id: 2, display_type: 1, name: 'Tyson Frozen Chicken', price: '6.99', valid_from: '2026-07-15', valid_to: '2026-07-21' },
    { id: 3, display_type: 1, name: 'Smart 4K Television', price: '299.99', valid_from: '2026-07-15', valid_to: '2026-07-21' },
    { id: 4, display_type: 5, name: 'Chicken marketing banner', price: '2.99', valid_from: '2026-07-15', valid_to: '2026-07-21' },
  ];
  const offers = normalizeFlippItems(items, { storeId: 'kroger-howell-mill', flyer, seenAt: '2026-07-18T12:00:00Z' });
  assert.equal(offers.length, 1);
  assert.equal(offers[0].price, 6.99);
  assert.equal(offers[0].sourceLocation.status, 'unlocated');
  assert.equal(offers[0].sourceLocation.pageNumber, null);
  assert.equal(offers[0].sourceLocation.deepLink, null);
  assert.equal(offers[0].sourceUrl, 'https://flipp.com/flyer/123');
  assert.equal(offers[0].retailerUrl, 'https://retailer.example/item/1');
});
