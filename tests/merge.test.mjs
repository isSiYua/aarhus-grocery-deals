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

test('deduplicates the same source offer before merging and archiving', () => {
  const fresh = { ...old, price:15, lastSeenAt:'2026-07-18' };
  const out = mergeIncrementally({ offers:[old], history:[] }, { netto:[fresh, fresh] }, { netto:'ok' }, '2026-07-18T07:00:00Z');
  assert.equal(out.offers.length, 1);
  assert.equal(out.history.length, 1);
});
