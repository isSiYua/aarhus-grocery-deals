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
  const offers = [];

  for (let offset = 0; offset < 10_000; offset += limit) {
    const page = await fetchPage('/offers', { dealer_id: dealerId, limit, offset });
    if (!Array.isArray(page)) throw new Error('Tjek offers response must be an array');
    offers.push(...page);
    if (page.length < limit) return offers;
  }

  throw new Error('Tjek offers pagination exceeded the safety limit');
}
