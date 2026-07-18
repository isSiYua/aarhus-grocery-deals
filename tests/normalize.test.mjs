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
