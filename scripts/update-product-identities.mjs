import fs from 'node:fs/promises';

const offersUrl = new URL('../data/current_offers.json', import.meta.url);
const historyUrl = new URL('../data/product_identity_history.json', import.meta.url);

async function readJson(url, fallback) {
  try { return JSON.parse(await fs.readFile(url, 'utf8')); } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function imageReference(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    for (const parameter of ['w', 'width', 'dpr', 'quality']) url.searchParams.delete(parameter);
    url.searchParams.sort();
    return url.toString();
  } catch {
    return String(value);
  }
}

function periodFor(offer) {
  return `${offer.validFrom || ''}|${offer.validUntil || ''}`;
}

function refreshEvidence(product) {
  const offerEntries = Object.values(product.offerIds);
  const repeatedSourceIds = offerEntries
    .filter(entry => entry.validPeriods.length > 1)
    .map(entry => entry.sourceOfferId)
    .sort();
  const sharedImagesAcrossOfferIds = Object.entries(product.imageReferences)
    .filter(([, entry]) => entry.offerIds.length > 1)
    .map(([reference, entry]) => ({ reference, offerIds: entry.offerIds }))
    .sort((a, b) => a.reference.localeCompare(b.reference));
  product.evidence = {
    distinctSourceOfferIdCount: offerEntries.length,
    sameNameSeenWithDifferentSourceIds: offerEntries.length > 1,
    repeatedSourceIdsAcrossPromotionPeriods: repeatedSourceIds,
    exactImageReferencesSharedAcrossSourceIds: sharedImagesAcrossOfferIds,
  };
}

const data = await readJson(offersUrl, { offers: [] });
const previous = await readJson(historyUrl, { schemaVersion: 1, updatedAt: null, products: {} });
if (previous.schemaVersion !== 1 || typeof previous.products !== 'object') throw new Error('Invalid product identity history');
const next = structuredClone(previous);
let newProducts = 0;
let newOfferIds = 0;
let newPeriods = 0;

for (const offer of data.offers) {
  const stableProductKey = offer.descriptionKey;
  if (!stableProductKey) continue;
  let product = next.products[stableProductKey];
  if (!product) {
    product = next.products[stableProductKey] = {
      stableProductKey,
      canonicalNames: [],
      categoryIds: [],
      comparisonGroups: [],
      stores: [],
      firstSeenAt: offer.discoveredAt || data.metadata?.updatedAt || null,
      lastPromotionEnd: offer.validUntil || null,
      offerIds: {},
      imageReferences: {},
      evidence: {},
    };
    newProducts += 1;
  }
  product.canonicalNames = uniqueSorted([...product.canonicalNames, offer.originalName]);
  product.categoryIds = uniqueSorted([...product.categoryIds, offer.categoryId]);
  product.comparisonGroups = uniqueSorted([...product.comparisonGroups, offer.comparisonGroup]);
  product.stores = uniqueSorted([...product.stores, offer.storeId]);
  if (offer.validUntil && (!product.lastPromotionEnd || offer.validUntil > product.lastPromotionEnd)) product.lastPromotionEnd = offer.validUntil;

  const sourceOfferId = offer.sourceOfferId || offer.canonicalKey;
  let source = product.offerIds[sourceOfferId];
  if (!source) {
    source = product.offerIds[sourceOfferId] = {
      sourceOfferId,
      stores: [],
      catalogIds: [],
      validPeriods: [],
      imageReferences: [],
    };
    newOfferIds += 1;
  }
  source.stores = uniqueSorted([...source.stores, offer.storeId]);
  source.catalogIds = uniqueSorted([...source.catalogIds, offer.sourceCatalogId]);
  const period = periodFor(offer);
  if (!source.validPeriods.includes(period)) {
    source.validPeriods = uniqueSorted([...source.validPeriods, period]);
    newPeriods += 1;
  }
  const reference = imageReference(offer.imageUrl);
  source.imageReferences = uniqueSorted([...source.imageReferences, reference]);
  if (reference) {
    const image = product.imageReferences[reference] || { offerIds: [], validPeriods: [] };
    image.offerIds = uniqueSorted([...image.offerIds, sourceOfferId]);
    image.validPeriods = uniqueSorted([...image.validPeriods, period]);
    product.imageReferences[reference] = image;
  }
}

for (const product of Object.values(next.products)) {
  product.offerIds = Object.fromEntries(Object.entries(product.offerIds).sort(([a], [b]) => a.localeCompare(b)));
  product.imageReferences = Object.fromEntries(Object.entries(product.imageReferences).sort(([a], [b]) => a.localeCompare(b)));
  refreshEvidence(product);
}
next.products = Object.fromEntries(Object.entries(next.products).sort(([a], [b]) => a.localeCompare(b)));

const comparablePrevious = JSON.stringify({ ...previous, updatedAt: null });
const comparableNext = JSON.stringify({ ...next, updatedAt: null });
if (comparablePrevious === comparableNext) {
  console.log(`Product identity history unchanged: ${Object.keys(next.products).length} stable products.`);
  process.exit(0);
}
next.updatedAt = data.metadata?.updatedAt || new Date().toISOString();
await fs.writeFile(historyUrl, JSON.stringify(next, null, 2) + '\n');
console.log(`Updated product identity history: ${newProducts} new stable products, ${newOfferIds} new source IDs, ${newPeriods} new promotion periods.`);
