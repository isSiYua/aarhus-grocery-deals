import fs from 'node:fs/promises';

import { normalizedText } from './taxonomy.mjs';
import { explainInChinese } from './explain-zh.mjs';
import { sanitizeItemDescriptionZh } from './description-quality.mjs';

export const DESCRIPTION_SCHEMA_VERSION = 2;
export const DESCRIPTION_SPEC_VERSION = 'zh-product-v5';

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

export function descriptionKeyFor(raw, classification) {
  const name = normalizedText(raw?.heading || raw?.originalName || '');
  const group = classification?.comparisonGroup || raw?.comparisonGroup || 'unknown';
  const detail = clothingDetailIdentity(raw, group);
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
  const cached = cache.entries?.[descriptionKey] || cache.entries?.[canonicalDescriptionKey];
  if (cached?.descriptionZh) {
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
    if (cache.entries?.[descriptionKey]?.descriptionZh || cache.entries?.[canonicalDescriptionKey]?.descriptionZh) continue;
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
    const cached = cache.entries?.[descriptionKey] || cache.entries?.[canonicalDescriptionKey];
    if (!cached?.descriptionZh) {
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
