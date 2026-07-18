import { classifyOffer, normalizedText } from './taxonomy.mjs';
import { explainInChinese } from './explain-zh.mjs';

const storeAlias = value => String(value || '').toLowerCase().replace(/ø/g,'o').replace(/æ/g,'ae').replace(/[^a-z0-9]+/g,'');
const STORE_NAMES = {
  netto: 'netto', lidl: 'lidl', rema1000: 'rema', rema: 'rema', '365discount': '365',
  fotex: 'foetex', foetex: 'foetex', bilka: 'bilka',
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

function quantityFields(raw) {
  const q = raw.quantity || {};
  const size = q.size?.from ?? null;
  const unit = q.unit?.symbol ?? null;
  const pieces = q.pieces?.from ?? null;
  return { size, unit, pieces };
}

function unitPrice(price, q) {
  if (!Number.isFinite(price)) return { value: null, unit: null, display: null };
  if (Number.isFinite(q.size) && q.size > 0 && q.unit) {
    const u = String(q.unit).toLowerCase();
    if (u === 'g') return { value: price / q.size * 1000, unit: 'DKK/kg', display: `${(price / q.size * 1000).toFixed(2)} DKK/kg` };
    if (u === 'kg') return { value: price / q.size, unit: 'DKK/kg', display: `${(price / q.size).toFixed(2)} DKK/kg` };
    if (u === 'ml') return { value: price / q.size * 1000, unit: 'DKK/L', display: `${(price / q.size * 1000).toFixed(2)} DKK/L` };
    if (u === 'l') return { value: price / q.size, unit: 'DKK/L', display: `${(price / q.size).toFixed(2)} DKK/L` };
  }
  if (Number.isFinite(q.pieces) && q.pieces > 0) return { value: price / q.pieces, unit: 'DKK/stk', display: `${(price / q.pieces).toFixed(2)} DKK/件` };
  return { value: null, unit: null, display: null };
}

function packageText(q, raw) {
  if (q.size && q.unit) return `${q.size} ${q.unit}`;
  if (q.pieces) return `${q.pieces} 件`;
  const match = String(raw.description || '').match(/\b\d+(?:[.,]\d+)?\s?(?:g|kg|ml|l|stk)\b/i);
  return match?.[0] || null;
}

function detectConditions(raw) {
  const text = `${raw.heading || ''} ${raw.description || ''}`.toLowerCase();
  const memberOnly = /lidl plus|netto\+|foetex plus|føtex plus|medlemspris|app pris/.test(text);
  const multi = text.match(/\b(\d+)\s*(?:for|stk\.?)\s*(\d+[.,]?\d*)/i);
  return { memberOnly, multiBuy: multi ? `${multi[1]}件组合价` : null };
}

export function normalizeOffer(raw, nowIso) {
  const storeId = getStoreId(raw);
  if (!storeId) return null;
  const classification = classifyOffer(raw);
  if (!classification) return null;
  const pricing = priceFields(raw);
  if (!Number.isFinite(pricing.price)) return null;
  const q = quantityFields(raw);
  const unit = unitPrice(pricing.price, q);
  const conditions = detectConditions(raw);
  const heading = String(raw.heading || '').trim();
  const canonicalKey = [storeId, normalizedText(heading), q.size || q.pieces || '', q.unit || ''].join('|');
  const sourceSlug = { netto:'Netto', lidl:'Lidl', rema:'REMA-1000', '365':'365discount', foetex:'fotex', bilka:'Bilka' }[storeId];
  const catalogPage = Number.isInteger(raw.catalog_page) && raw.catalog_page >= 1 ? raw.catalog_page : null;
  return {
    id: canonicalKey,
    canonicalKey,
    sourceOfferId: raw.id,
    storeId,
    originalName: heading,
    originalDescription: raw.description || '',
    zhExplanation: explainInChinese(raw, classification),
    ...classification,
    ...pricing,
    packageText: packageText(q, raw),
    quantity: q.size || q.pieces || null,
    quantityUnit: q.unit || (q.pieces ? 'stk' : null),
    unitPriceValue: unit.value,
    unitPriceUnit: unit.unit,
    unitPriceDisplay: unit.display,
    ...conditions,
    validFrom: raw.run_from,
    validUntil: raw.run_till,
    sourceUrl: `https://etilbudsavis.dk/${sourceSlug}`,
    sourcePage: catalogPage,
    sourceCatalogId: raw.catalog_id || null,
    sourceLocation: catalogPage
      ? { status: 'verified', pageNumber: catalogPage, positionLabel: null, deepLink: null, verifiedAt: nowIso, method: 'tjek_catalog_page' }
      : { status: 'unlocated', pageNumber: null, positionLabel: null, deepLink: null, verifiedAt: null, method: null },
    discoveredAt: nowIso,
    lastSeenAt: nowIso,
    status: 'active',
    changeType: 'new',
  };
}
