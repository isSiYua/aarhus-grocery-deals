import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeIncrementally } from '../scripts/lib/merge.mjs';

const old = { canonicalKey:'netto|egg|10|stk', storeId:'netto', price:20, validUntil:'2026-08-01', discoveredAt:'2026-07-01', lastSeenAt:'2026-07-17' };

test('unchanged offer preserves discovery date', () => {
  const fresh = { ...old, price:20, lastSeenAt:'2026-07-18', changeType:'new' };
  const out = mergeIncrementally({ offers:[old], history:[] }, { netto:[fresh] }, { netto:'ok' }, '2026-07-18T07:00:00Z');
  assert.equal(out.offers[0].discoveredAt, '2026-07-01');
  assert.equal(out.offers[0].lastSeenAt, '2026-07-17');
  assert.equal(out.offers[0].changeType, null);
});

test('unchanged newly discovered offer keeps its badge without rewriting confirmation timestamps', () => {
  const previous = { ...old, changeType: 'new', priceDropAmount: null };
  const fresh = { ...previous, lastSeenAt: '2026-07-18', changeType: 'new' };
  const out = mergeIncrementally({ offers:[previous], history:[] }, { netto:[fresh] }, { netto:'ok' }, '2026-07-18T07:00:00Z');
  assert.equal(out.offers[0].lastSeenAt, '2026-07-17');
  assert.equal(out.offers[0].changeType, 'new');
});

test('price drop replaces current and archives old', () => {
  const fresh = { ...old, price:15, lastSeenAt:'2026-07-18' };
  const out = mergeIncrementally({ offers:[old], history:[] }, { netto:[fresh] }, { netto:'ok' }, '2026-07-18T07:00:00Z');
  assert.equal(out.offers[0].changeType, 'price_drop');
  assert.equal(out.history.length, 1);
});

test('failed source retains old offer as unconfirmed', () => {
  const out = mergeIncrementally({ offers:[old], history:[] }, {}, { netto:'failed' }, '2026-07-18T07:00:00Z');
  assert.equal(out.offers[0].status, 'unconfirmed');
});

test('successful source removes a missing offer instead of showing a reconfirmation warning', () => {
  const out = mergeIncrementally({ offers:[old], history:[] }, { netto:[] }, { netto:'ok' }, '2026-07-18T07:00:00Z');
  assert.equal(out.offers.length, 0);
  assert.equal(out.history[0].status, 'withdrawn');
});

test('pagination-capped source retains a missing offer until its stated expiry', () => {
  const out = mergeIncrementally(
    { offers: [old], history: [] },
    { netto: [] },
    { netto: 'partial' },
    '2026-07-18T07:00:00Z',
  );
  assert.deepEqual(out.offers, [old]);
  assert.equal(out.history.length, 0);
});

test('pagination-capped source removes a missing offer after its stated expiry', () => {
  const expired = { ...old, validUntil: '2026-07-17T23:59:59Z' };
  const out = mergeIncrementally(
    { offers: [expired], history: [] },
    { netto: [] },
    { netto: 'partial' },
    '2026-07-18T07:00:00Z',
  );
  assert.equal(out.offers.length, 0);
  assert.equal(out.history[0].status, 'expired');
});

test('store-scoped refresh preserves every unselected chain unchanged', () => {
  const rema = { ...old, canonicalKey: 'rema|milk|1|l', storeId: 'rema', price: 12 };
  const out = mergeIncrementally(
    { offers: [old, rema], history: [] },
    { netto: [{ ...old, price: 18 }] },
    { netto: 'ok', rema: 'skipped' },
    '2026-07-18T07:00:00Z',
  );
  const preserved = out.offers.find(offer => offer.storeId === 'rema');
  assert.deepEqual(preserved, rema);
  assert.equal(out.history.some(offer => offer.storeId === 'rema'), false);
});

test('deduplicates the same source offer before merging and archiving', () => {
  const fresh = { ...old, price:15, lastSeenAt:'2026-07-18' };
  const out = mergeIncrementally({ offers:[old], history:[] }, { netto:[fresh, fresh] }, { netto:'ok' }, '2026-07-18T07:00:00Z');
  assert.equal(out.offers.length, 1);
  assert.equal(out.history.length, 1);
});

test('reuses a reviewed promotion when only the upstream catalogue identity changes', () => {
  const reviewed = {
    ...old,
    canonicalKey: '365|lekaform|100|pcs|old-source',
    id: '365|lekaform|100|pcs|old-source',
    storeId: '365',
    productKey: '365|lekaform|100|pcs',
    originalName: 'Lekaform*',
    originalDescription: '100 stk. Stk.-pris 0,20. Frit valg.',
    price: 20,
    quantity: 100,
    quantityUnit: 'pcs',
    validFrom: '2026-07-23',
    validUntil: '2026-07-29',
    sourceOfferId: 'old-source',
    descriptionKey: 'reviewed-key',
    zhExplanation: '逐图审核过的中文说明。',
  };
  const alias = {
    ...reviewed,
    canonicalKey: '365|lekaform|100|pcs|new-source',
    id: '365|lekaform|100|pcs|new-source',
    originalName: 'Lekaform',
    originalDescription: '100 stk. Stk.-pris 0,20. Frit valg.',
    sourceOfferId: 'new-source',
    descriptionKey: 'unreviewed-image-variant',
    zhExplanation: '规则兜底说明。',
    imageUrl: 'https://example.test/new-crop.webp',
  };
  const out = mergeIncrementally(
    { offers: [reviewed], history: [] },
    { 365: [alias] },
    { 365: 'ok' },
    '2026-07-22T18:00:00Z',
  );
  assert.deepEqual(out.offers, [reviewed]);
  assert.equal(out.history.length, 0);
});

test('does not reuse an upstream alias when the price or validity changes', () => {
  const previous = {
    ...old,
    canonicalKey: '365|milk|1|l|old-source',
    storeId: '365',
    productKey: '365|milk|1|l',
    originalName: 'Milk',
    originalDescription: '1 liter',
    validFrom: '2026-07-20',
    validUntil: '2026-07-26',
  };
  const nextWeek = {
    ...previous,
    canonicalKey: '365|milk|1|l|new-source',
    price: 18,
    validFrom: '2026-07-27',
    validUntil: '2026-08-02',
  };
  const out = mergeIncrementally(
    { offers: [previous], history: [] },
    { 365: [nextWeek] },
    { 365: 'ok' },
    '2026-07-22T18:00:00Z',
  );
  assert.equal(out.offers[0].canonicalKey, nextWeek.canonicalKey);
  assert.equal(out.history[0].status, 'withdrawn');
});
