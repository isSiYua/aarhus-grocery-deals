import fs from 'node:fs/promises';

import { normalizedText } from './taxonomy.mjs';
import { explainInChinese } from './explain-zh.mjs';

export const DESCRIPTION_SCHEMA_VERSION = 1;
export const DESCRIPTION_PROMPT_VERSION = 'zh-product-v1';
export const DEFAULT_DESCRIPTION_MODEL = 'gpt-5.6-sol';

export function descriptionKeyFor(raw, classification) {
  const name = normalizedText(raw?.heading || raw?.originalName || '');
  const group = classification?.comparisonGroup || raw?.comparisonGroup || 'unknown';
  return `v1|${name}|${group}`;
}

export function emptyDescriptionCache() {
  return {
    schemaVersion: DESCRIPTION_SCHEMA_VERSION,
    promptVersion: DESCRIPTION_PROMPT_VERSION,
    defaultModel: DEFAULT_DESCRIPTION_MODEL,
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

export function resolveProductDescription(raw, classification, cache = emptyDescriptionCache()) {
  const descriptionKey = descriptionKeyFor(raw, classification);
  const cached = cache.entries?.[descriptionKey];
  if (cached?.descriptionZh) {
    return {
      descriptionKey,
      zhExplanation: cached.descriptionZh,
      descriptionSource: 'ai_cache',
      descriptionModel: cached.model || null,
      descriptionPromptVersion: cached.promptVersion || cache.promptVersion || null,
    };
  }
  return {
    descriptionKey,
    zhExplanation: explainInChinese(raw, classification),
    descriptionSource: 'rules_fallback',
  };
}

export function collectPendingDescriptions(offers, cache = emptyDescriptionCache(), generatedAt = new Date().toISOString()) {
  const pending = new Map();
  for (const offer of offers) {
    const descriptionKey = offer.descriptionKey || descriptionKeyFor(offer, offer);
    if (cache.entries?.[descriptionKey]?.descriptionZh) continue;
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
    promptVersion: DESCRIPTION_PROMPT_VERSION,
    generatedAt,
    count: items.length,
    items,
  };
}

export function applyDescriptionCacheToOffers(offers, cache) {
  let applied = 0;
  const nextOffers = offers.map(offer => {
    const descriptionKey = offer.descriptionKey || descriptionKeyFor(offer, offer);
    const cached = cache.entries?.[descriptionKey];
    if (!cached?.descriptionZh) {
      const { descriptionModel: _model, descriptionPromptVersion: _prompt, ...rest } = offer;
      return { ...rest, descriptionKey, descriptionSource: 'rules_fallback' };
    }
    if (offer.zhExplanation !== cached.descriptionZh || offer.descriptionSource !== 'ai_cache') applied += 1;
    return {
      ...offer,
      descriptionKey,
      zhExplanation: cached.descriptionZh,
      descriptionSource: 'ai_cache',
      descriptionModel: cached.model || null,
      descriptionPromptVersion: cached.promptVersion || cache.promptVersion || null,
    };
  });
  return { offers: nextOffers, applied };
}
