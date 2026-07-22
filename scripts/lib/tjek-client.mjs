const BASE_URL = 'https://api.etilbudsavis.dk/v2';
const TIMEOUT_MS = 12_000;
const RETRIES = 3;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k,v]) => v !== undefined && v !== null && url.searchParams.set(k, String(v)));
  let lastError;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'aarhus-grocery-deals/0.1 (+personal price comparison)' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (response.status === 429 || response.status >= 500) {
        await sleep(500 * 2 ** attempt);
        continue;
      }
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES - 1) await sleep(500 * 2 ** attempt);
    }
  }
  throw lastError || new Error('Tjek API request failed');
}

export async function listDanishDealers(fetchPage = fetchJson) {
  const limit = 200;
  const dealers = [];

  for (let offset = 0; offset < 10_000; offset += limit) {
    const page = await fetchPage('/dealers', { country_id: 'DK', limit, offset });
    if (!Array.isArray(page)) throw new Error('Tjek dealers response must be an array');
    dealers.push(...page);
    if (page.length < limit) return dealers;
  }

  throw new Error('Tjek dealers pagination exceeded the safety limit');
}

export async function fetchDealerOffers(dealerId, fetchPage = fetchJson) {
  const limit = 100;
  // Tjek rejects offset=1000 with PAGINATION_MAX_REACHED. Large dealers such
  // as Bilka can fill all ten allowed pages, so return the 1000 available
  // records instead of discarding the entire dealer refresh on the 11th call.
  const maximumOffsetExclusive = 1_000;
  const offers = [];

  for (let offset = 0; offset < maximumOffsetExclusive; offset += limit) {
    const page = await fetchPage('/offers', { dealer_id: dealerId, limit, offset });
    if (!Array.isArray(page)) throw new Error('Tjek offers response must be an array');
    offers.push(...page);
    if (page.length < limit) return offers;
  }

  // Preserve the Array API for callers while exposing that absence is not
  // authoritative: there may be more current rows beyond Tjek's hard limit.
  Object.defineProperty(offers, 'truncated', { value: true, enumerable: false });
  return offers;
}

export async function fetchDealerStores(dealerId, options = {}, fetchPage = fetchJson) {
  const limit = 100;
  const stores = [];
  const {
    latitude = 56.1629,
    longitude = 10.2039,
    radius = 35_000,
  } = options;

  for (let offset = 0; offset < 10_000; offset += limit) {
    const page = await fetchPage('/stores', {
      dealer_id: dealerId,
      r_lat: latitude,
      r_lng: longitude,
      r_radius: radius,
      limit,
      offset,
    });
    if (!Array.isArray(page)) throw new Error('Tjek stores response must be an array');
    stores.push(...page);
    if (page.length < limit) return stores;
  }

  throw new Error('Tjek stores pagination exceeded the safety limit');
}
