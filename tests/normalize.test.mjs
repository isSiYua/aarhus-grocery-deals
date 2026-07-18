import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOffer } from '../scripts/lib/normalize.mjs';

const baseOffer = {
  id: 'offer-1',
  heading: 'Kyllingebryst 1 kg',
  description: '1 kg',
  pricing: { price: 49, currency: 'DKK' },
  quantity: { size: { from: 1 }, unit: { symbol: 'kg' } },
  run_from: '2026-07-18T00:00:00Z',
  run_till: '2026-07-25T00:00:00Z',
  catalog_id: 'catalog-1',
  images: { zoom: 'http://image-transformer-api.tjek.com/product.webp?w=1000' },
  dealer: { name: 'Netto' },
  branding: { name: 'Netto' },
};

test('uses the explicit Tjek catalog page as a verified source location', () => {
  const normalized = normalizeOffer({ ...baseOffer, catalog_page: 17 }, '2026-07-18T12:00:00Z');
  assert.equal(normalized.sourcePage, 17);
  assert.equal(normalized.sourceCatalogId, 'catalog-1');
  assert.equal(normalized.sourceUrl, 'https://etilbudsavis.dk/Netto?publication=catalog-1&offer=offer-1');
  assert.equal(normalized.imageUrl, 'https://image-transformer-api.tjek.com/product.webp?w=1000');
  assert.deepEqual(normalized.sourceLocation, {
    status: 'verified',
    pageNumber: 17,
    positionLabel: null,
    deepLink: null,
    verifiedAt: '2026-07-18T12:00:00Z',
    method: 'tjek_catalog_page',
  });
});

test('does not invent a page when Tjek omits catalog_page', () => {
  const normalized = normalizeOffer(baseOffer, '2026-07-18T12:00:00Z');
  assert.equal(normalized.sourcePage, null);
  assert.equal(normalized.sourceLocation.status, 'unlocated');
});

test('uses package size for pcs instead of treating a multi-pack as one piece', () => {
  const normalized = normalizeOffer({
    ...baseOffer,
    heading: 'Nektariner 6 stk',
    quantity: { size: { from: 6 }, unit: { symbol: 'pcs' }, pieces: { from: 1 } },
    pricing: { price: 25, currency: 'DKK' },
  }, '2026-07-18T12:00:00Z');
  assert.equal(normalized.packageText, '6 pcs');
  assert.equal(normalized.unitPriceValue, 25 / 6);
  assert.equal(normalized.unitPriceDisplay, '4.17 DKK/件');
});

test('uses the total weight of an explicit multipack for unit price', () => {
  const normalized = normalizeOffer({
    ...baseOffer,
    heading: 'MADVÆRKET Ribeyesteaks',
    description: 'Af ungkvæg. 2 x 180 g / pk. Pr. kg 222,08.',
    quantity: { size: { from: 180 }, unit: { symbol: 'g' } },
    pricing: { price: 79.95, currency: 'DKK' },
  }, '2026-07-18T12:00:00Z');
  assert.equal(normalized.packageText, '2 × 180 g（共 360 g）');
  assert.equal(normalized.quantity, 360);
  assert.equal(normalized.packageCount, 2);
  assert.equal(normalized.perItemQuantity, 180);
  assert.equal(normalized.unitPriceDisplay, '222.08 DKK/kg');
});

test('preserves a source that already reports the multipack total', () => {
  const normalized = normalizeOffer({
    ...baseOffer,
    heading: 'MAGNUM Ispinde',
    description: '8 x 100 ml. Pr. liter 86,25',
    quantity: { size: { from: 800 }, unit: { symbol: 'ml' } },
    pricing: { price: 69, currency: 'DKK' },
  }, '2026-07-18T12:00:00Z');
  assert.equal(normalized.packageText, '8 × 100 ml（共 800 ml）');
  assert.equal(normalized.quantity, 800);
  assert.equal(normalized.unitPriceDisplay, '86.25 DKK/L');
});

test('does not invent one denominator for a cross-size assortment', () => {
  const normalized = normalizeOffer({
    ...baseOffer,
    heading: 'Sensodyne tandpasta, tandbørster 2-pak eller Listerine mundskyl',
    description: '2x75 ml/500 ml Partivare. Max. 200.00 pr. liter/Max. 15.00 pr. stk.',
    quantity: { size: { from: 75 }, unit: { symbol: 'ml' } },
    pricing: { price: 30, currency: 'DKK' },
  }, '2026-07-18T12:00:00Z');
  assert.equal(normalized.packageCount, null);
  assert.equal(normalized.quantity, null);
  assert.equal(normalized.packageText, '多规格任选');
  assert.equal(normalized.unitPriceDisplay, null);
  assert.equal(normalized.packageComparisonStatus, 'ambiguous_assortment');
});

test('keeps the same product stable for shopping but separates current and upcoming offer instances', () => {
  const current = normalizeOffer(baseOffer, '2026-07-18T12:00:00Z');
  const upcoming = normalizeOffer({
    ...baseOffer,
    id: 'offer-2',
    run_from: '2026-07-26T00:00:00Z',
    run_till: '2026-08-01T00:00:00Z',
  }, '2026-07-18T12:00:00Z');
  assert.equal(current.productKey, upcoming.productKey);
  assert.notEqual(current.canonicalKey, upcoming.canonicalKey);
});
