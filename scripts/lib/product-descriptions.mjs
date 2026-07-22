import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

import { normalizedText } from './taxonomy.mjs';
import { explainInChinese } from './explain-zh.mjs';
import { sanitizeItemDescriptionZh } from './description-quality.mjs';

export const DESCRIPTION_SCHEMA_VERSION = 2;
export const DESCRIPTION_SPEC_VERSION = 'zh-product-v6';

export function isCurrentDescriptionEntry(entry) {
  return Boolean(entry?.descriptionZh && entry.descriptionSpecVersion === DESCRIPTION_SPEC_VERSION);
}

function currentCachedEntry(cache, ...keys) {
  for (const key of keys) {
    const entry = cache.entries?.[key];
    if (isCurrentDescriptionEntry(entry)) return entry;
  }
  return null;
}

function clothingDetailIdentity(raw, group) {
  if (!String(group || '').startsWith('clothing_')) return '';
  const description = String(raw?.description || raw?.originalDescription || '');
  const facts = [];
  const sizeToken = '(?:\\d{1,2}XL|XXXL|XXL|XL|XS|S|M|L|\\d{1,3})';
  const sizePattern = new RegExp(
    `\\b(?:Str\\.?\\s*:?\\s*)?(${sizeToken}(?:\\s*[-–/]\\s*${sizeToken}){1,3})(?:\\s*cm\\b)?(?=\\s*(?:[.,;)]|$))`,
    'i',
  );
  const size = description.match(sizePattern);
  if (size) facts.push(size[0]);
  const material = description.match(/(?:100\s*%\s*)?(?:(?:ø|o)kologisk\s*)?bomuld(?:\s*\/\s*(?:polyester|elastan))?|viscose\s*\/\s*polyamid/i);
  if (material) facts.push(material[0]);
  return normalizedText(facts.join(' '));
}

// A short flyer heading is not always a product identity. Retailers repeatedly
// publish headings such as "Spiritusmarked", "Rygsæk" and "Færdigretter" while
// changing every option shown underneath. Reusing a review by heading alone in
// those cases silently assigns the wrong products, flavours or specifications
// to another store/week. Keep ordinary named groceries reusable, but bind
// ambiguous complex offers to the meaningful option text (or, as a last resort,
// the flyer image crop) so only genuinely identical evidence shares a review.
const VARIANT_SENSITIVE_GROUP = /^(?:alcohol_|ready_meal$|supplements$|electronics_|home_|leisure_|clothing_|personal_)/;
const AMBIGUOUS_HEADING = /(?:^| )(?:spiritusmarked|vinmarked|vin marked|bag in box marked|frost ?marked|to go marked|asiatisk marked|faerdigret(?:ter)?|middagsretter|familleret|rygsaek|taske|mini taske|dyne|hovedpude|stovsuger|robotstovsuger|ledningsfri stovsuger|tv|fjernsyn|skaerm|computer|elmarked)(?: |$)/;
const COMMERCIAL_NOISE = /\b(?:flere varianter|frit valg|partivare|spot|skarp pris|normalpris|pr stk|pr pakke|pr pose|pr flaske|pr box|pr liter|literpris|kg pris|kg pris max|max kg pris|max literpris|gaelder kun|med appen|ekskl embl|plus pris|ved kob af flere end)\b/g;

function meaningfulVariantEvidence(raw) {
  const source = String(raw?.description || raw?.originalDescription || '')
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:ml|cl|dl|l|liter|g|kg|stk|pak|pcs|cm|mm|w|mah|hz|tommer)\b/gi, ' ')
    .replace(/\b\d+(?:[.,]\d+)?\s*%\b/g, ' ');
  return normalizedText(source)
    .replace(COMMERCIAL_NOISE, ' ')
    .replace(/\b(?:max|pris|kr|dkk|per|kun|tilbud|ugen|uge|dag|kunde|denne|pris)\b/g, ' ')
    .replace(/\b\d+(?:[.,]\d+)?\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function imageEvidence(raw) {
  // Tjek's API returns the crop under `images`, while normalized/published
  // offers expose the same crop as `imageUrl`. Both stages must hash the same
  // evidence or a reviewed generic flyer heading falls back on every refresh.
  const value = String(
    raw?.imageUrl
      || raw?.images?.zoom
      || raw?.images?.view
      || raw?.images?.thumb
      || '',
  ).trim();
  if (!value) return '';
  try {
    const url = new URL(value);
    for (const parameter of ['w', 'width', 'dpr', 'quality']) url.searchParams.delete(parameter);
    url.searchParams.sort();
    return url.toString();
  } catch {
    return value;
  }
}

function variantDetailIdentity(raw, group) {
  if (!VARIANT_SENSITIVE_GROUP.test(String(group || ''))) return '';
  const name = normalizedText(raw?.heading || raw?.originalName || '');
  const detail = meaningfulVariantEvidence(raw);
  const hasChoiceEvidence = /\b(?:eller|frit valg|flere varianter|marked)\b/.test(normalizedText(
    `${raw?.heading || raw?.originalName || ''} ${raw?.description || raw?.originalDescription || ''}`,
  ));
  const shortGenericName = name.split(' ').filter(Boolean).length <= 2;
  if (!AMBIGUOUS_HEADING.test(name) && !(shortGenericName && hasChoiceEvidence)) return '';
  const evidence = detail.length >= 8 ? detail : imageEvidence(raw);
  if (!evidence) return '';
  return `variant-${createHash('sha256').update(evidence).digest('hex').slice(0, 12)}`;
}

export function descriptionKeyFor(raw, classification) {
  const name = normalizedText(raw?.heading || raw?.originalName || '');
  const group = classification?.comparisonGroup || raw?.comparisonGroup || 'unknown';
  const detail = clothingDetailIdentity(raw, group) || variantDetailIdentity(raw, group);
  return `v1|${name}|${group}${detail ? `|${detail}` : ''}`;
}

export function emptyDescriptionCache() {
  return {
    schemaVersion: DESCRIPTION_SCHEMA_VERSION,
    descriptionSpecVersion: DESCRIPTION_SPEC_VERSION,
    maintainedBy: 'Codex',
    updatedAt: null,
    entries: {},
  };
}

export async function loadDescriptionCache(fileUrl) {
  try {
    const parsed = JSON.parse(await fs.readFile(fileUrl, 'utf8'));
    if (parsed.schemaVersion !== DESCRIPTION_SCHEMA_VERSION || !parsed.entries || typeof parsed.entries !== 'object') {
      throw new Error('Unsupported product description cache shape');
    }
    return parsed;
  } catch (error) {
    if (error?.code === 'ENOENT') return emptyDescriptionCache();
    throw error;
  }
}

export function resolveProductDescription(raw, classification, cache = emptyDescriptionCache(), fixedDescriptionKey = null) {
  const descriptionKey = fixedDescriptionKey || descriptionKeyFor(raw, classification);
  const canonicalDescriptionKey = descriptionKeyFor(raw, classification);
  const cached = currentCachedEntry(cache, descriptionKey, canonicalDescriptionKey);
  if (cached) {
    return {
      descriptionKey,
      productNameZh: cached.productNameZh || null,
      zhExplanation: sanitizeItemDescriptionZh(cached.descriptionZh),
      descriptionSource: 'codex_cache',
      descriptionAuthor: cached.authoredBy || 'Codex',
      descriptionVersion: cached.descriptionSpecVersion || cache.descriptionSpecVersion || null,
    };
  }
    return {
      descriptionKey,
      productNameZh: null,
      zhExplanation: sanitizeItemDescriptionZh(explainInChinese(raw, classification)),
    descriptionSource: 'rules_fallback',
  };
}

export function collectPendingDescriptions(offers, cache = emptyDescriptionCache(), generatedAt = new Date().toISOString()) {
  const pending = new Map();
  for (const offer of offers) {
    const descriptionKey = offer.descriptionKey || descriptionKeyFor(offer, offer);
    const canonicalDescriptionKey = descriptionKeyFor(offer, offer);
    if (currentCachedEntry(cache, descriptionKey, canonicalDescriptionKey)) continue;
    const current = pending.get(descriptionKey);
    if (current) {
      current.occurrences += 1;
      if (!current.stores.includes(offer.storeId)) current.stores.push(offer.storeId);
      if (!current.sampleDescriptions.includes(offer.originalDescription || '') && current.sampleDescriptions.length < 3) {
        current.sampleDescriptions.push(offer.originalDescription || '');
      }
      continue;
    }
    pending.set(descriptionKey, {
      descriptionKey,
      originalName: offer.originalName,
      sampleDescriptions: [offer.originalDescription || ''],
      categoryId: offer.categoryId,
      comparisonGroup: offer.comparisonGroup,
      stores: [offer.storeId],
      occurrences: 1,
    });
  }
  const items = [...pending.values()]
    .map(item => ({ ...item, stores: item.stores.sort(), sampleDescriptions: item.sampleDescriptions.filter(Boolean) }))
    .sort((a, b) => a.descriptionKey.localeCompare(b.descriptionKey));
  return {
    schemaVersion: DESCRIPTION_SCHEMA_VERSION,
    descriptionSpecVersion: DESCRIPTION_SPEC_VERSION,
    generatedAt,
    count: items.length,
    items,
  };
}

export function applyDescriptionCacheToOffers(offers, cache) {
  let applied = 0;
  const nextOffers = offers.map(offer => {
    const descriptionKey = offer.descriptionKey || descriptionKeyFor(offer, offer);
    const canonicalDescriptionKey = descriptionKeyFor(offer, offer);
    const cached = currentCachedEntry(cache, descriptionKey, canonicalDescriptionKey);
    if (!cached) {
      const fallback = sanitizeItemDescriptionZh(explainInChinese(
        {
          heading: offer.originalName || offer.heading || '',
          description: offer.originalDescription || offer.description || '',
        },
        { categoryId: offer.categoryId, comparisonGroup: offer.comparisonGroup },
      ));
      const {
        descriptionModel: _model,
        descriptionPromptVersion: _prompt,
        descriptionAuthor: _author,
        descriptionVersion: _version,
        ...rest
      } = offer;
      if (offer.zhExplanation !== fallback || offer.descriptionSource !== 'rules_fallback') applied += 1;
      return { ...rest, descriptionKey, zhExplanation: fallback, descriptionSource: 'rules_fallback' };
    }
    const descriptionZh = sanitizeItemDescriptionZh(cached.descriptionZh);
    if (offer.zhExplanation !== descriptionZh || offer.descriptionSource !== 'codex_cache') applied += 1;
    return {
      ...offer,
      descriptionKey,
      productNameZh: cached.productNameZh || offer.productNameZh || null,
      zhExplanation: descriptionZh,
      descriptionSource: 'codex_cache',
      descriptionAuthor: cached.authoredBy || 'Codex',
      descriptionVersion: cached.descriptionSpecVersion || cache.descriptionSpecVersion || null,
    };
  });
  return { offers: nextOffers, applied };
}
