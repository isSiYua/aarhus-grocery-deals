import { classifyOffer, normalizedText } from './taxonomy.mjs';
import { descriptionKeyFor, resolveProductDescription } from './product-descriptions.mjs';
import { resolveProductTaxonomy } from './product-taxonomy.mjs';

const storeAlias = value => String(value || '').toLowerCase().replace(/ø/g,'o').replace(/æ/g,'ae').replace(/[^a-z0-9]+/g,'');
const STORE_NAMES = {
  netto: 'netto', lidl: 'lidl', rema1000: 'rema', rema: 'rema', '365discount': '365',
  fotex: 'foetex', foetex: 'foetex', bilka: 'bilka',
  kvickly: 'kvickly', meny: 'meny', lovbjerg: 'loevbjerg',
  superbrugsen: 'superbrugsen', spar: 'spar', minkobmand: 'min_koebmand',
  letkob: 'letkoeb', brugsen: 'brugsen', salling: 'salling',
  woltmarket: 'wolt_market',
};

const SOURCE_SLUGS = {
  netto: 'Netto', lidl: 'Lidl', rema: 'REMA-1000', '365': '365discount',
  foetex: 'fotex', bilka: 'Bilka', kvickly: 'Kvickly', meny: 'Meny',
  loevbjerg: 'Lovbjerg', superbrugsen: 'SuperBrugsen', spar: 'SPAR',
  min_koebmand: 'Min-Kobmand', brugsen: 'Brugsen', letkoeb: 'Let-Kob',
  salling: 'Salling',
  wolt_market: 'Wolt-Market',
};

function getStoreId(raw) {
  const candidates = [raw.branding?.name, raw.dealer?.name].filter(Boolean).map(storeAlias);
  for (const candidate of candidates) {
    for (const [needle, id] of Object.entries(STORE_NAMES)) if (candidate.includes(needle)) return id;
  }
  return null;
}

function priceFields(raw) {
  return {
    price: raw.pricing?.price ?? null,
    prePrice: raw.pricing?.pre_price ?? null,
    currency: raw.pricing?.currency || 'DKK',
  };
}

const normalizedUnit = value => String(value || '').toLowerCase().replace('liter', 'l');
const measurementPattern = /\d+(?:[.,]\d+)?\s*(?:g|kg|ml|l)\b/gi;

export function explicitMultipack(description, baseSize = null, baseUnit = null) {
  const text = String(description || '');
  const match = text.match(/\b(\d{1,3})\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l)\b/i);
  if (!match) return null;
  const count = Number(match[1]);
  const eachSize = Number(match[2].replace(',', '.'));
  const unit = normalizedUnit(match[3]);
  const measurements = text.match(measurementPattern) || [];
  if (!Number.isInteger(count) || count < 2 || count > 100 || !Number.isFinite(eachSize) || eachSize <= 0) return null;
  // A description such as "2x75 ml/500 ml" is a cross-size assortment.
  // It has no single honest package denominator, so keep it incomparable.
  if (measurements.length !== 1) return { ambiguous: true, count, eachSize, unit, totalSize: null };
  const totalSize = count * eachSize;
  if (Number.isFinite(baseSize) && Math.abs(baseSize - eachSize) > 0.001 && Math.abs(baseSize - totalSize) > 0.001) return null;
  if (baseUnit && normalizedUnit(baseUnit) !== unit) return null;
  return { count, eachSize, unit, totalSize };
}

function quantityFields(raw) {
  const q = raw.quantity || {};
  const size = q.size?.from ?? null;
  const unit = q.unit?.symbol ?? null;
  const pieces = q.pieces?.from ?? null;
  const multipack = explicitMultipack(raw.description, size, unit);
  if (multipack?.ambiguous) return { size: null, unit: null, pieces: null, multipack: null, ambiguousMultipack: true };
  if (multipack) return { size: multipack.totalSize, unit: multipack.unit, pieces: multipack.count, multipack };
  return { size, unit, pieces, multipack: null, ambiguousMultipack: false };
}

function unitPrice(price, q) {
  if (!Number.isFinite(price)) return { value: null, unit: null, display: null };
  if (Number.isFinite(q.size) && q.size > 0 && q.unit) {
    const u = String(q.unit).toLowerCase();
    if (u === 'g') return { value: price / q.size * 1000, unit: 'DKK/kg', display: `${(price / q.size * 1000).toFixed(2)} DKK/kg` };
    if (u === 'kg') return { value: price / q.size, unit: 'DKK/kg', display: `${(price / q.size).toFixed(2)} DKK/kg` };
    if (u === 'ml') return { value: price / q.size * 1000, unit: 'DKK/L', display: `${(price / q.size * 1000).toFixed(2)} DKK/L` };
    if (u === 'l') return { value: price / q.size, unit: 'DKK/L', display: `${(price / q.size).toFixed(2)} DKK/L` };
    if (['pcs', 'pc', 'stk', 'piece', 'pieces'].includes(u)) {
      return { value: price / q.size, unit: 'DKK/stk', display: `${(price / q.size).toFixed(2)} DKK/件` };
    }
  }
  if (Number.isFinite(q.pieces) && q.pieces > 0) return { value: price / q.pieces, unit: 'DKK/stk', display: `${(price / q.pieces).toFixed(2)} DKK/件` };
  return { value: null, unit: null, display: null };
}

function packageText(q, raw) {
  if (q.ambiguousMultipack) return '多规格任选';
  if (q.multipack) return `${q.multipack.count} × ${q.multipack.eachSize} ${q.multipack.unit}（共 ${q.multipack.totalSize} ${q.multipack.unit}）`;
  if (q.size && q.unit) return `${q.size} ${q.unit}`;
  if (q.pieces) return `${q.pieces} 件`;
  const match = String(raw.description || '').match(/\b\d+(?:[.,]\d+)?\s?(?:g|kg|ml|l|stk)\b/i);
  return match?.[0] || null;
}

export function repairPublishedPackage(record) {
  const multipack = explicitMultipack(record.originalDescription, record.perItemQuantity ?? record.quantity, record.perItemQuantityUnit ?? record.quantityUnit);
  if (!multipack) return record;
  const q = multipack.ambiguous
    ? { size: null, unit: null, pieces: null, multipack: null, ambiguousMultipack: true }
    : { size: multipack.totalSize, unit: multipack.unit, pieces: multipack.count, multipack, ambiguousMultipack: false };
  const unit = unitPrice(record.price, q);
  const productKey = record.productKey
    ? [record.storeId, normalizedText(record.originalName), q.size || '', q.unit || ''].join('|')
    : null;
  const canonicalKey = productKey && record.sourceOfferId ? `${productKey}|${record.sourceOfferId}` : record.canonicalKey;
  return {
    ...record,
    ...(productKey ? { productKey, canonicalKey, id: canonicalKey } : {}),
    packageText: packageText(q, { description: record.originalDescription }),
    quantity: q.size || null,
    quantityUnit: q.unit || null,
    packageCount: q.multipack?.count || null,
    perItemQuantity: q.multipack?.eachSize || null,
    perItemQuantityUnit: q.multipack?.unit || null,
    packageComparisonStatus: q.ambiguousMultipack ? 'ambiguous_assortment' : 'exact',
    unitPriceValue: unit.value,
    unitPriceUnit: unit.unit,
    unitPriceDisplay: unit.display,
  };
}

function detectConditions(raw) {
  const text = `${raw.heading || ''} ${raw.description || ''}`.toLowerCase();
  const memberOnly = /lidl plus|netto\+|foetex plus|føtex plus|medlemspris|app pris/.test(text);
  const multi = text.match(/\b(\d+)\s*(?:for|stk\.?)\s*(\d+[.,]?\d*)/i);
  return { memberOnly, multiBuy: multi ? `${multi[1]}件组合价` : null };
}

function imageUrl(raw) {
  const candidate = raw.images?.zoom || raw.images?.view || raw.images?.thumb;
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol === 'http:') url.protocol = 'https:';
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function normalizeOffer(raw, nowIso, options = {}) {
  const storeId = getStoreId(raw);
  if (!storeId) return null;
  const reviewOverride = options.reviewOverrides?.entries?.[normalizedText(raw.heading || '')] || null;
  if (reviewOverride?.status === 'excluded') return null;
  const baseClassification = reviewOverride?.categoryId && reviewOverride?.comparisonGroup
    ? { categoryId: reviewOverride.categoryId, comparisonGroup: reviewOverride.comparisonGroup }
    : classifyOffer(raw);
  if (!baseClassification) return null;
  const pricing = priceFields(raw);
  if (!Number.isFinite(pricing.price)) return null;
  const q = quantityFields(raw);
  const unit = unitPrice(pricing.price, q);
  const conditions = detectConditions(raw);
  const heading = String(raw.heading || '').trim();
  const descriptionKey = descriptionKeyFor(raw, baseClassification);
  const classification = resolveProductTaxonomy(descriptionKey, baseClassification, options.productTaxonomy);
  if (!classification) return null;
  const description = resolveProductDescription(raw, classification, options.descriptionCache, descriptionKey);
  const productKey = [storeId, normalizedText(heading), q.size || q.pieces || '', q.unit || ''].join('|');
  const catalogId = String(raw.catalog_id || '').trim() || null;
  const sourceOfferId = String(raw.id || '').trim() || null;
  const offerIdentity = sourceOfferId || [catalogId || 'no-catalog', raw.run_from || '', raw.run_till || ''].join('|');
  const canonicalKey = `${productKey}|${offerIdentity}`;
  const sourceSlug = SOURCE_SLUGS[storeId];
  const catalogPage = Number.isInteger(raw.catalog_page) && raw.catalog_page >= 1 ? raw.catalog_page : null;
  const sourceUrl = catalogId
    ? `https://etilbudsavis.dk/${sourceSlug}?publication=${encodeURIComponent(catalogId)}${sourceOfferId ? `&offer=${encodeURIComponent(sourceOfferId)}` : ''}`
    : `https://etilbudsavis.dk/${sourceSlug}`;
  return {
    id: canonicalKey,
    canonicalKey,
    productKey,
    sourceOfferId,
    storeId,
    originalName: heading,
    originalDescription: raw.description || '',
    ...description,
    ...classification,
    ...pricing,
    packageText: packageText(q, raw),
    quantity: q.size || q.pieces || null,
    quantityUnit: q.unit || (q.pieces ? 'stk' : null),
    packageCount: q.multipack?.count || null,
    perItemQuantity: q.multipack?.eachSize || null,
    perItemQuantityUnit: q.multipack?.unit || null,
    packageComparisonStatus: q.ambiguousMultipack ? 'ambiguous_assortment' : 'exact',
    unitPriceValue: unit.value,
    unitPriceUnit: unit.unit,
    unitPriceDisplay: unit.display,
    ...conditions,
    validFrom: raw.run_from,
    validUntil: raw.run_till,
    imageUrl: imageUrl(raw),
    sourceUrl,
    sourcePage: catalogPage,
    sourceCatalogId: catalogId,
    sourceLocation: catalogPage
      ? { status: 'verified', pageNumber: catalogPage, positionLabel: null, deepLink: null, verifiedAt: nowIso, method: 'tjek_catalog_page' }
      : { status: 'unlocated', pageNumber: null, positionLabel: null, deepLink: null, verifiedAt: null, method: null },
    discoveredAt: nowIso,
    lastSeenAt: nowIso,
    status: 'active',
    changeType: 'new',
  };
}
