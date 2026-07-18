import fs from 'node:fs/promises';

import { descriptionKeyFor } from './lib/product-descriptions.mjs';
import { AARHUS_CATEGORIES, AARHUS_COMPARISON_GROUPS, classifyOffer, isClearlyOutOfScope } from './lib/taxonomy.mjs';

const offersUrl = new URL('../data/current_offers.json', import.meta.url);
const taxonomyUrl = new URL('../data/product_taxonomy_zh.json', import.meta.url);
const descriptionsUrl = new URL('../data/product_descriptions_zh.json', import.meta.url);
const data = JSON.parse(await fs.readFile(offersUrl, 'utf8'));
const taxonomy = JSON.parse(await fs.readFile(taxonomyUrl, 'utf8'));
const descriptions = JSON.parse(await fs.readFile(descriptionsUrl, 'utf8'));
const now = new Date().toISOString();

const reviewedCorrections = new Map([
  ['Gulerødder med top', {
    categoryId: 'vegetables',
    comparisonGroup: 'carrots',
    labelZh: '带叶胡萝卜',
    reasonZh: '商品主体是胡萝卜；带叶、大小与包装不构成新的比较品种。',
  }],
]);

const byOldKey = new Map();
for (const offer of data.offers) {
  if (!byOldKey.has(offer.descriptionKey)) byOldKey.set(offer.descriptionKey, offer);
}

let reclassified = 0;
let excluded = 0;
let migratedKeys = 0;
for (const [oldKey, offer] of byOldKey) {
  const fixed = taxonomy.entries[oldKey];
  if (!fixed) continue;
  const correction = reviewedCorrections.get(offer.originalName);
  const rules = classifyOffer({ heading: offer.originalName, description: offer.originalDescription });

  if (isClearlyOutOfScope({ heading: offer.originalName, description: offer.originalDescription })) {
    taxonomy.entries[oldKey] = {
      status: 'excluded',
      labelZh: '非收录商品',
      reasonZh: '名称明确显示为家电、耐用品、酒精饮料或其他不在当前采购范围内的商品。',
      originalName: offer.originalName,
      authoredBy: 'Codex',
      reviewStatus: 'reviewed',
      taxonomyVersion: taxonomy.taxonomyVersion,
    };
    excluded += 1;
    continue;
  }

  const classification = correction
    || (fixed.reviewStatus === 'reviewed'
      ? { categoryId: fixed.categoryId, comparisonGroup: fixed.comparisonGroup }
      : rules)
    || { categoryId: fixed.categoryId, comparisonGroup: fixed.comparisonGroup };
  const newKey = descriptionKeyFor({ heading: offer.originalName }, classification);
  const group = AARHUS_COMPARISON_GROUPS[classification.comparisonGroup];
  const next = {
    ...fixed,
    ...classification,
    originalName: offer.originalName,
    taxonomyVersion: taxonomy.taxonomyVersion,
  };

  if (correction) {
    Object.assign(next, correction, { authoredBy: 'Codex', reviewStatus: 'reviewed' });
  } else if (fixed.reviewStatus !== 'reviewed') {
    Object.assign(next, {
      labelZh: group?.nameZh || fixed.labelZh || offer.originalName,
      reasonZh: `按商品主体与形态规则归入“${group?.nameZh || classification.comparisonGroup}”；品牌、尺寸和包装不单独拆组。`,
      authoredBy: 'rules_reconciled',
      reviewStatus: 'pending_codex_review',
    });
  }

  taxonomy.entries[newKey] = next;
  if (newKey !== oldKey) {
    migratedKeys += 1;
    if (fixed.reviewStatus !== 'reviewed') delete taxonomy.entries[oldKey];
    if (descriptions.entries[oldKey] && !descriptions.entries[newKey]) {
      descriptions.entries[newKey] = { ...descriptions.entries[oldKey], originalName: offer.originalName };
    }
  }
  if (classification.categoryId !== fixed.categoryId || classification.comparisonGroup !== fixed.comparisonGroup) reclassified += 1;
}

const nextOffers = [];
for (const offer of data.offers) {
  const fixed = taxonomy.entries[offer.descriptionKey];
  if (fixed?.status === 'excluded') continue;
  const correction = reviewedCorrections.get(offer.originalName);
  const rules = classifyOffer({ heading: offer.originalName, description: offer.originalDescription });
  const classification = correction
    || (fixed?.reviewStatus === 'reviewed'
      ? { categoryId: fixed.categoryId, comparisonGroup: fixed.comparisonGroup }
      : rules)
    || { categoryId: offer.categoryId, comparisonGroup: offer.comparisonGroup };
  const descriptionKey = descriptionKeyFor({ heading: offer.originalName }, classification);
  const entry = taxonomy.entries[descriptionKey];
  nextOffers.push({
    ...offer,
    ...classification,
    descriptionKey,
    taxonomySource: entry?.reviewStatus === 'reviewed' ? 'codex_taxonomy' : 'fixed_pending_review',
    taxonomyReviewStatus: entry?.reviewStatus || 'pending_codex_review',
    taxonomyLabelZh: entry?.labelZh || null,
    taxonomyReasonZh: entry?.reasonZh || null,
  });
}

taxonomy.updatedAt = now;
descriptions.updatedAt = now;
data.categories = AARHUS_CATEGORIES;
data.comparisonGroups = AARHUS_COMPARISON_GROUPS;
data.offers = nextOffers;

await fs.writeFile(taxonomyUrl, `${JSON.stringify(taxonomy, null, 2)}\n`);
await fs.writeFile(descriptionsUrl, `${JSON.stringify(descriptions, null, 2)}\n`);
await fs.writeFile(offersUrl, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Reconciled pending taxonomy: ${reclassified} products changed group, ${migratedKeys} keys migrated, ${excluded} out-of-scope products removed.`);
