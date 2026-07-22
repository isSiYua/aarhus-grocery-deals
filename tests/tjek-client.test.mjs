import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchDealerOffers, fetchDealerStores, listDanishDealers } from '../scripts/lib/tjek-client.mjs';

test('fetches every dealer directory page so REMA is not omitted', async () => {
  const calls = [];
  const firstPage = Array.from({ length: 200 }, (_, index) => ({ id: `dealer-${index}`, name: `Dealer ${index}` }));
  const secondPage = [{ id: '11deC', name: 'REMA 1000' }];

  const dealers = await listDanishDealers(async (path, params) => {
    calls.push({ path, params });
    return params.offset === 0 ? firstPage : secondPage;
  });

  assert.equal(dealers.length, 201);
  assert.equal(dealers.at(-1).name, 'REMA 1000');
  assert.deepEqual(calls, [
    { path: '/dealers', params: { country_id: 'DK', limit: 200, offset: 0 } },
    { path: '/dealers', params: { country_id: 'DK', limit: 200, offset: 200 } },
  ]);
});

test('fetches dealer offers with the API maximum and follows offset pagination', async () => {
  const calls = [];
  const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: `first-${index}` }));
  const secondPage = [{ id: 'last' }];

  const offers = await fetchDealerOffers('dealer-1', async (path, params) => {
    calls.push({ path, params });
    return params.offset === 0 ? firstPage : secondPage;
  });

  assert.equal(offers.length, 101);
  assert.equal(offers.truncated, undefined);
  assert.deepEqual(calls, [
    { path: '/offers', params: { dealer_id: 'dealer-1', limit: 100, offset: 0 } },
    { path: '/offers', params: { dealer_id: 'dealer-1', limit: 100, offset: 100 } },
  ]);
});

test('returns the 1000 records exposed by Tjek instead of requesting forbidden offset 1000', async () => {
  const calls = [];
  const offers = await fetchDealerOffers('large-dealer', async (path, params) => {
    calls.push({ path, params });
    return Array.from({ length: 100 }, (_, index) => ({ id: `${params.offset + index}` }));
  });

  assert.equal(offers.length, 1000);
  assert.equal(offers.truncated, true);
  assert.equal(calls.length, 10);
  assert.equal(calls.at(-1).params.offset, 900);
});

test('rejects an invalid offers response instead of looping', async () => {
  await assert.rejects(
    () => fetchDealerOffers('dealer-1', async () => ({ offers: [] })),
    /must be an array/,
  );
});

test('fetches every nearby dealer store with Aarhus coordinates and pagination', async () => {
  const calls = [];
  const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: `store-${index}` }));
  const secondPage = [{ id: 'store-last' }];

  const stores = await fetchDealerStores('dealer-1', {}, async (path, params) => {
    calls.push({ path, params });
    return params.offset === 0 ? firstPage : secondPage;
  });

  assert.equal(stores.length, 101);
  assert.deepEqual(calls, [
    { path: '/stores', params: { dealer_id: 'dealer-1', r_lat: 56.1629, r_lng: 10.2039, r_radius: 35000, limit: 100, offset: 0 } },
    { path: '/stores', params: { dealer_id: 'dealer-1', r_lat: 56.1629, r_lng: 10.2039, r_radius: 35000, limit: 100, offset: 100 } },
  ]);
});
