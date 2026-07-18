import fs from 'node:fs/promises';
import { refineAarhusCategory, refineAarhusComparisonGroup } from './taxonomy.mjs';

export const TAXONOMY_SCHEMA_VERSION = 1;
export const TAXONOMY_VERSION = 'codex-taxonomy-v1';

export function emptyProductTaxonomy() {
  return {
    schemaVersion: TAXONOMY_SCHEMA_VERSION,
    taxonomyVersion: TAXONOMY_VERSION,
    maintainedBy: 'Codex',
    updatedAt: null,
    entries: {},
  };
}

export async function loadProductTaxonomy(fileUrl) {
  try {
    const parsed = JSON.parse(await fs.readFile(fileUrl, 'utf8'));
    if (parsed.schemaVersion !== TAXONOMY_SCHEMA_VERSION || parsed.taxonomyVersion !== TAXONOMY_VERSION || typeof parsed.entries !== 'object') {
      throw new Error('Unsupported product taxonomy shape');
    }
    return parsed;
  } catch (error) {
    if (error?.code === 'ENOENT') return emptyProductTaxonomy();
    throw error;
  }
}

export function resolveProductTaxonomy(descriptionKey, fallback, taxonomy = emptyProductTaxonomy()) {
  const fixed = taxonomy.entries?.[descriptionKey];
  if (!fixed) return { ...fallback, taxonomySource: 'rules_fallback', taxonomyReviewStatus: 'unreviewed' };
  if (fixed.status === 'excluded') return null;
  const comparisonGroup = refineAarhusComparisonGroup(fixed.comparisonGroup, fixed.originalName || descriptionKey.split('|')[1]);
  return {
    categoryId: refineAarhusCategory(fixed.categoryId, comparisonGroup),
    comparisonGroup,
    taxonomySource: fixed.reviewStatus === 'reviewed' ? 'codex_taxonomy' : 'fixed_pending_review',
    taxonomyReviewStatus: fixed.reviewStatus,
    taxonomyLabelZh: fixed.labelZh || null,
    taxonomyReasonZh: fixed.reasonZh || null,
  };
}

export function applyProductTaxonomyToOffers(offers, taxonomy) {
  let changed = 0;
  let excluded = 0;
  const next = [];
  for (const offer of offers) {
    const fallback = { categoryId: offer.categoryId, comparisonGroup: offer.comparisonGroup };
    const classification = resolveProductTaxonomy(offer.descriptionKey, fallback, taxonomy);
    if (!classification) {
      excluded += 1;
      continue;
    }
    if (offer.categoryId !== classification.categoryId || offer.comparisonGroup !== classification.comparisonGroup || offer.taxonomySource !== classification.taxonomySource) changed += 1;
    next.push({ ...offer, ...classification });
  }
  return { offers: next, changed, excluded };
}

export function collectPendingTaxonomy(offers, taxonomy, generatedAt = new Date().toISOString()) {
  const items = [];
  const seen = new Set();
  for (const offer of offers) {
    if (seen.has(offer.descriptionKey)) continue;
    seen.add(offer.descriptionKey);
    const fixed = taxonomy.entries?.[offer.descriptionKey];
    if (fixed?.reviewStatus === 'reviewed' || fixed?.status === 'excluded') continue;
    items.push({
      descriptionKey: offer.descriptionKey,
      originalName: offer.originalName,
      originalDescription: offer.originalDescription || '',
      currentCategoryId: fixed?.categoryId || offer.categoryId,
      currentComparisonGroup: fixed?.comparisonGroup || offer.comparisonGroup,
      currentReviewStatus: fixed?.reviewStatus || 'unreviewed',
      storeId: offer.storeId,
      imageUrl: offer.imageUrl || null,
    });
  }
  items.sort((a, b) => a.descriptionKey.localeCompare(b.descriptionKey));
  return {
    schemaVersion: TAXONOMY_SCHEMA_VERSION,
    taxonomyVersion: TAXONOMY_VERSION,
    generatedAt,
    count: items.length,
    items,
  };
}
