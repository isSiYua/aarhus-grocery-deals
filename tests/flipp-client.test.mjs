import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFlippFlyerUrl,
  buildFlippItemUrl,
  chooseCurrentFlyer,
  fetchFlyerItems,
  fetchFlyers,
  classifyFlippItem,
  ATLANTA_COMPARISON_GROUPS,
  normalizeFlippItems,
} from '../scripts/lib/flipp-client.mjs';

test('builds a location-pinned Atlanta flyer URL that cannot fall back to Aarhus', () => {
  assert.equal(
    buildFlippFlyerUrl(8021698, { postalCode: '30318', locationSlug: 'atlanta-ga' }),
    'https://flipp.com/en-us/atlanta-ga/flyer/8021698?postal_code=30318',
  );
});

test('builds a location-pinned Flipp item URL that opens the exact offer card', () => {
  assert.equal(
    buildFlippItemUrl(1025400151, { merchant: 'Publix', name: 'Weekly Ad' }, { postalCode: '30318', locationSlug: 'atlanta-ga' }),
    'https://flipp.com/en-us/atlanta-ga/item/1025400151-publix-weekly-ad?postal_code=30318',
  );
});

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

test('uses product-level Atlanta comparison groups without splitting size variants', () => {
  assert.equal(classifyFlippItem('Publix Idaho Russet Potatoes').comparisonGroup, 'produce_potatoes');
  assert.equal(classifyFlippItem('Private Selection Gourmet Potatoes').comparisonGroup, 'produce_potatoes');
  assert.equal(classifyFlippItem('Small Red Seedless Watermelon').comparisonGroup, 'produce_watermelon');
  assert.equal(classifyFlippItem('Publix White Mushrooms').comparisonGroup, 'produce_mushrooms');
  assert.equal(classifyFlippItem('GreenWise Chicken Drumsticks or Bone-In Thighs').comparisonGroup, 'meat_chicken_thigh');
  assert.equal(classifyFlippItem('Publix Whole Young Chicken').comparisonGroup, 'meat_whole_chicken');
  assert.equal(classifyFlippItem('Tree-Ripened Peaches or Nectarines').comparisonGroup, 'produce_peaches');
  assert.equal(classifyFlippItem("Kellogg's Mega Size Rice Krispies Treats").comparisonGroup, 'snacks_other');
  assert.equal(classifyFlippItem('Publix Ground Pork').comparisonGroup, 'meat_ground_pork');
  assert.equal(classifyFlippItem('Publix Smoked Pulled Pork').comparisonGroup, 'meat_pulled_pork');
  for (const name of ['Publix Idaho Russet Potatoes', 'Small Red Seedless Watermelon', 'Publix Whole Young Chicken']) {
    const classification = classifyFlippItem(name);
    assert.ok(ATLANTA_COMPARISON_GROUPS[classification.comparisonGroup]);
  }
});

test('keeps comparison grouping broader than the product-specific Chinese explanation', () => {
  const russet = classifyFlippItem('Publix Idaho Russet Potatoes');
  const gourmet = classifyFlippItem('Private Selection Gourmet Potatoes');
  assert.equal(russet.comparisonGroup, gourmet.comparisonGroup);
  assert.match(russet.zhExplanation, /Russet 褐皮土豆/);
  assert.doesNotMatch(gourmet.zhExplanation, /Russet/);
  assert.match(gourmet.zhExplanation, /大小|规格/);

  const peaches = classifyFlippItem('Tree-Ripened Peaches or Nectarines');
  assert.match(peaches.zhExplanation, /桃或油桃/);
  assert.doesNotMatch(peaches.zhExplanation, /^李子/);
  assert.match(classifyFlippItem('Organic Plums').zhExplanation, /^李子/);
});

test('uses the complete Atlanta product name instead of misleading ingredient words', () => {
  const beans = classifyFlippItem("Van Camp's Pork and Beans");
  assert.equal(beans.categoryId, 'pantry');
  assert.match(beans.zhExplanation, /猪肉焗豆罐头/);
  assert.doesNotMatch(beans.zhExplanation, /^肉类/);

  const croissants = classifyFlippItem('Private Selection Fresh Baked Butter Croissants');
  assert.equal(croissants.categoryId, 'bakery');
  assert.match(croissants.zhExplanation, /黄油可颂/);

  const mushrooms = classifyFlippItem('Kroger Whole or Baby Bella Mushrooms');
  assert.equal(mushrooms.categoryId, 'produce');
  assert.match(mushrooms.zhExplanation, /鲜蘑菇/);
});

test('rejects electronics and apparel that only contain incidental grocery words', () => {
  assert.equal(classifyFlippItem('Apple AirPods 4'), null);
  assert.equal(classifyFlippItem('BLACK+DECKER Toaster with Bagel Mode'), null);
  assert.equal(classifyFlippItem("Athletic Works Women's Water Shoes"), null);
  assert.equal(classifyFlippItem('Ninja CREAMi ice cream, gelato & sorbet maker'), null);
});

test('classifies packaged product form before fruit and butter flavor words', () => {
  assert.equal(classifyFlippItem('Capri Sun Fruit Punch Juice Drink Blend').categoryId, 'drinks');
  assert.equal(classifyFlippItem('Great Value Concord Grape Jelly').categoryId, 'pantry');
  assert.equal(classifyFlippItem('Great Value Creamy Peanut Butter').categoryId, 'pantry');
  assert.equal(classifyFlippItem('Ricola lemon, lime & mint dry-mouth-relief lozenges').categoryId, 'personal');
  assert.equal(classifyFlippItem('Lärabar The Original Fruit & Nut Bar').categoryId, 'snacks');
});

test('normalizes real priced groceries, removes duplicates, and uses the exact Flipp item instead of a generic retailer campaign', () => {
  const flyer = { id: 123, merchant: 'Kroger', name: 'Weekly Ad', valid_from: '2026-07-15', valid_to: '2026-07-21' };
  const items = [
    { id: 1, display_type: 1, name: 'Tyson Frozen Chicken', price: '6.99', valid_from: '2026-07-15', valid_to: '2026-07-21', ttm_url: 'http://retailer.example/item/1' },
    { id: 2, display_type: 1, name: 'Tyson Frozen Chicken', price: '6.99', valid_from: '2026-07-15', valid_to: '2026-07-21' },
    { id: 3, display_type: 1, name: 'Smart 4K Television', price: '299.99', valid_from: '2026-07-15', valid_to: '2026-07-21' },
    { id: 4, display_type: 5, name: 'Chicken marketing banner', price: '2.99', valid_from: '2026-07-15', valid_to: '2026-07-21' },
  ];
  const offers = normalizeFlippItems(items, {
    storeId: 'kroger-howell-mill',
    flyer,
    seenAt: '2026-07-18T12:00:00Z',
    postalCode: '30318',
    locationSlug: 'atlanta-ga',
  });
  assert.equal(offers.length, 1);
  assert.equal(offers[0].price, 6.99);
  assert.equal(offers[0].sourceLocation.status, 'direct');
  assert.equal(offers[0].sourceLocation.pageNumber, null);
  assert.equal(offers[0].itemId, 1);
  assert.equal(offers[0].sourceLocation.deepLink, 'https://flipp.com/en-us/atlanta-ga/item/1-kroger-weekly-ad?postal_code=30318');
  assert.equal(offers[0].sourceUrl, 'https://flipp.com/en-us/atlanta-ga/item/1-kroger-weekly-ad?postal_code=30318');
  assert.equal(offers[0].flyerUrl, 'https://flipp.com/en-us/atlanta-ga/flyer/123?postal_code=30318');
  assert.equal(offers[0].retailerUrl, 'https://retailer.example/item/1');
});
