import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchDealerOffers } from '../scripts/lib/tjek-client.mjs';

test('fetches dealer offers with the API maximum and follows offset pagination', async () => {
  const calls = [];
  const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: `first-${index}` }));
  const secondPage = [{ id: 'last' }];

  const offers = await fetchDealerOffers('dealer-1', async (path, params) => {
    calls.push({ path, params });
    return params.offset === 0 ? firstPage : secondPage;
  });

  assert.equal(offers.length, 101);
  assert.deepEqual(calls, [
    { path: '/offers', params: { dealer_id: 'dealer-1', limit: 100, offset: 0 } },
    { path: '/offers', params: { dealer_id: 'dealer-1', limit: 100, offset: 100 } },
  ]);
});

test('rejects an invalid offers response instead of looping', async () => {
  await assert.rejects(
    () => fetchDealerOffers('dealer-1', async () => ({ offers: [] })),
    /must be an array/,
  );
});
