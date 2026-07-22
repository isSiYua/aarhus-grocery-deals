import test from 'node:test';
import assert from 'node:assert/strict';

import { isAarhusRelevantOffer, isAarhusStore, publicStoreRecord } from '../scripts/lib/aarhus-coverage.mjs';

test('Aarhus store directory keeps municipality postcodes and original public names', () => {
  const raw = {
    id: 'store-1', name: 'Aarhus C, Nørre Allé', street: 'Nørre Allé 24-26',
    city: 'Aarhus C', zip_code: '8000 ', latitude: 56.16, longitude: 10.2,
  };
  assert.equal(isAarhusStore(raw), true);
  assert.deepEqual(publicStoreRecord(raw, 'REMA 1000'), {
    id: 'store-1', name: 'Aarhus C, Nørre Allé', address: 'Nørre Allé 24-26, 8000 Aarhus C',
    street: 'Nørre Allé 24-26', city: 'Aarhus C', zipCode: '8000', latitude: 56.16, longitude: 10.2,
  });
  assert.equal(isAarhusStore({ zip_code: '8700' }), false);
});

test('store-bound offers must belong to Aarhus and outside Løvbjerg JA TAK posts are withheld', () => {
  assert.equal(isAarhusRelevantOffer({ store_id: 'local' }, 'netto', new Set(['local'])), true);
  assert.equal(isAarhusRelevantOffer({ store_id: 'horsens' }, 'netto', new Set(['local'])), false);
  assert.equal(isAarhusRelevantOffer({ description: 'JA TAK. Vi ses i Løvbjerg HORSENS' }, 'loevbjerg'), false);
  assert.equal(isAarhusRelevantOffer({ description: 'JA TAK. Vi ses i Løvbjerg Trøjborg' }, 'loevbjerg'), true);
  assert.equal(isAarhusRelevantOffer({ description: 'Ugens landsdækkende tilbud' }, 'loevbjerg'), true);
});
