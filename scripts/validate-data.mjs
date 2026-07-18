import fs from 'node:fs/promises';
const data = JSON.parse(await fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'));
const atlanta = JSON.parse(await fs.readFile(new URL('../data/atlanta_offers.json', import.meta.url), 'utf8'));
const descriptionCache = JSON.parse(await fs.readFile(new URL('../data/product_descriptions_zh.json', import.meta.url), 'utf8'));
const descriptionPending = JSON.parse(await fs.readFile(new URL('../data/product_descriptions_pending.json', import.meta.url), 'utf8'));
const requiredTop = ['metadata','stores','categories','comparisonGroups','offers'];
for (const key of requiredTop) if (!(key in data)) throw new Error(`Missing top-level key: ${key}`);
if ('history' in data) throw new Error('Archive history must stay in data/history.json, not current_offers.json');
const storeIds = new Set(data.stores.map(s => s.id));
const categoryIds = new Set(data.categories.map(c => c.id));
const ids = new Set();
for (const [index, offer] of data.offers.entries()) {
  for (const key of ['canonicalKey','storeId','originalName','zhExplanation','descriptionKey','descriptionSource','categoryId','comparisonGroup','price','validUntil']) {
    if (offer[key] === undefined || offer[key] === null || offer[key] === '') throw new Error(`Offer ${index} missing ${key}`);
  }
  if (ids.has(offer.canonicalKey)) throw new Error(`Duplicate canonicalKey: ${offer.canonicalKey}`);
  ids.add(offer.canonicalKey);
  if (!storeIds.has(offer.storeId)) throw new Error(`Unknown store ${offer.storeId}`);
  if (!categoryIds.has(offer.categoryId)) throw new Error(`Unknown category ${offer.categoryId}`);
  if (offer.categoryId === 'drinks' && !/coca[- ]?cola zero|coke zero|sprite zero/i.test(offer.originalName)) throw new Error(`Disallowed drink: ${offer.originalName}`);
  if (!['ai_cache','rules_fallback'].includes(offer.descriptionSource)) throw new Error(`Invalid description source: ${offer.canonicalKey}`);
  if (offer.descriptionSource === 'ai_cache' && descriptionCache.entries?.[offer.descriptionKey]?.descriptionZh !== offer.zhExplanation) throw new Error(`AI description is not backed by cache: ${offer.canonicalKey}`);
  if (!['unlocated','direct','verified'].includes(offer.sourceLocation?.status)) throw new Error(`Invalid source location status: ${offer.canonicalKey}`);
  if (offer.sourceLocation?.status === 'verified' && (!Number.isInteger(offer.sourceLocation.pageNumber) || offer.sourceLocation.pageNumber < 1)) throw new Error(`Invalid verified source location: ${offer.canonicalKey}`);
}

if (descriptionCache.schemaVersion !== 1 || descriptionCache.promptVersion !== 'zh-product-v1' || typeof descriptionCache.entries !== 'object') throw new Error('Invalid product description cache');
if (descriptionPending.schemaVersion !== 1 || !Array.isArray(descriptionPending.items) || descriptionPending.count !== descriptionPending.items.length) throw new Error('Invalid pending description queue');
const pendingKeys = new Set();
for (const item of descriptionPending.items) {
  if (!item.descriptionKey || !item.originalName || !item.categoryId || !item.comparisonGroup) throw new Error('Incomplete pending description item');
  if (pendingKeys.has(item.descriptionKey)) throw new Error(`Duplicate pending description: ${item.descriptionKey}`);
  if (descriptionCache.entries[item.descriptionKey]) throw new Error(`Cached description still pending: ${item.descriptionKey}`);
  pendingKeys.add(item.descriptionKey);
}
const publishedDescriptionFiles = JSON.stringify({ descriptionCache, descriptionPending });
if (/sk-[A-Za-z0-9_-]{20,}|OPENAI_API_KEY\s*[:=]\s*[^"\s]+/.test(publishedDescriptionFiles)) throw new Error('Possible API secret in published description data');

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
console.log(`Validated ${data.offers.length} Aarhus offers across ${data.stores.length} stores, ${atlanta.offers.length} Atlanta offers, ${Object.keys(descriptionCache.entries).length} cached AI descriptions, and ${descriptionPending.count} queued descriptions.`);
