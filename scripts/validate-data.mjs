import fs from 'node:fs/promises';
const data = JSON.parse(await fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'));
const atlanta = JSON.parse(await fs.readFile(new URL('../data/atlanta_offers.json', import.meta.url), 'utf8'));
const requiredTop = ['metadata','stores','categories','comparisonGroups','offers'];
for (const key of requiredTop) if (!(key in data)) throw new Error(`Missing top-level key: ${key}`);
const storeIds = new Set(data.stores.map(s => s.id));
const categoryIds = new Set(data.categories.map(c => c.id));
const ids = new Set();
for (const [index, offer] of data.offers.entries()) {
  for (const key of ['canonicalKey','storeId','originalName','zhExplanation','categoryId','comparisonGroup','price','validUntil']) {
    if (offer[key] === undefined || offer[key] === null || offer[key] === '') throw new Error(`Offer ${index} missing ${key}`);
  }
  if (ids.has(offer.canonicalKey)) throw new Error(`Duplicate canonicalKey: ${offer.canonicalKey}`);
  ids.add(offer.canonicalKey);
  if (!storeIds.has(offer.storeId)) throw new Error(`Unknown store ${offer.storeId}`);
  if (!categoryIds.has(offer.categoryId)) throw new Error(`Unknown category ${offer.categoryId}`);
  if (offer.categoryId === 'drinks' && !/coca[- ]?cola zero|coke zero|sprite zero/i.test(offer.originalName)) throw new Error(`Disallowed drink: ${offer.originalName}`);
  if (!['unlocated','direct','verified'].includes(offer.sourceLocation?.status)) throw new Error(`Invalid source location status: ${offer.canonicalKey}`);
  if (offer.sourceLocation?.status === 'verified' && (!Number.isInteger(offer.sourceLocation.pageNumber) || offer.sourceLocation.pageNumber < 1)) throw new Error(`Invalid verified source location: ${offer.canonicalKey}`);
}

if (!atlanta.metadata || !Array.isArray(atlanta.offers) || !Array.isArray(atlanta.flyers) || !Array.isArray(atlanta.categories) || !atlanta.comparisonGroups) throw new Error('Invalid Atlanta data shape');
const atlantaStoreIds = new Set(['kroger-howell-mill', 'publix-howell-mill', 'whole-foods-midtown', 'target-midtown', 'walmart-mlk']);
const atlantaCategoryIds = new Set(atlanta.categories.map(category => category.id));
const atlantaIds = new Set();
for (const [index, offer] of atlanta.offers.entries()) {
  for (const key of ['canonicalKey','storeId','originalName','zhExplanation','categoryId','price','currency','validFrom','validUntil','sourceUrl','itemId']) {
    if (offer[key] === undefined || offer[key] === null || offer[key] === '') throw new Error(`Atlanta offer ${index} missing ${key}`);
  }
  if (atlantaIds.has(offer.canonicalKey)) throw new Error(`Duplicate Atlanta canonicalKey: ${offer.canonicalKey}`);
  atlantaIds.add(offer.canonicalKey);
  if (!atlantaStoreIds.has(offer.storeId)) throw new Error(`Unknown Atlanta store ${offer.storeId}`);
  if (!atlantaCategoryIds.has(offer.categoryId) || offer.comparisonGroup !== offer.categoryId) throw new Error(`Invalid Atlanta category: ${offer.canonicalKey}`);
  if (offer.currency !== 'USD' || !Number.isFinite(offer.price) || offer.price <= 0) throw new Error(`Invalid Atlanta price: ${offer.canonicalKey}`);
  const expectedFlyerUrl = `https://flipp.com/en-us/atlanta-ga/flyer/${offer.flyerId}?postal_code=30318`;
  const expectedItemPrefix = `https://flipp.com/en-us/atlanta-ga/item/${offer.itemId}-`;
  if (!offer.sourceUrl.startsWith(expectedItemPrefix) || !offer.sourceUrl.endsWith('?postal_code=30318')) throw new Error(`Atlanta item URL is not pinned to 30318: ${offer.canonicalKey}`);
  if (offer.flyerUrl !== expectedFlyerUrl) throw new Error(`Atlanta flyer URL is not pinned to 30318: ${offer.canonicalKey}`);
  if (offer.sourceLocation?.status !== 'direct') throw new Error(`Invalid Atlanta source status: ${offer.canonicalKey}`);
  if (offer.sourceLocation.pageNumber !== null) throw new Error(`Atlanta page number must not be inferred: ${offer.canonicalKey}`);
  if (offer.sourceLocation.deepLink !== offer.sourceUrl || offer.sourceLocation.method !== 'flipp-item-id') throw new Error(`Atlanta direct source missing exact item link: ${offer.canonicalKey}`);
}
for (const flyer of atlanta.flyers) {
  const expectedFlyerUrl = `https://flipp.com/en-us/atlanta-ga/flyer/${flyer.id}?postal_code=30318`;
  if (flyer.url !== expectedFlyerUrl) throw new Error(`Atlanta flyer directory URL is not pinned to 30318: ${flyer.storeId}`);
}
console.log(`Validated ${data.offers.length} Aarhus offers across ${data.stores.length} stores and ${atlanta.offers.length} Atlanta offers.`);
