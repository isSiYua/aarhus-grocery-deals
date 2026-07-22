import fs from 'node:fs/promises';
import path from 'node:path';

import { ATLANTA_COMPARISON_GROUPS, classifyFlippItem, flippKnowledgeKey } from './lib/flipp-client.mjs';
import { emptyAtlantaProductKnowledge, loadAtlantaProductKnowledge } from './lib/flipp-product-knowledge.mjs';
import { sanitizeItemDescriptionZh } from './lib/description-quality.mjs';

const root = path.resolve(import.meta.dirname, '..');
const offersUrl = new URL('../data/atlanta_offers.json', import.meta.url);
const knowledgeUrl = new URL('../data/atlanta_product_knowledge_zh.json', import.meta.url);
const data = JSON.parse(await fs.readFile(offersUrl, 'utf8'));
const existing = await loadAtlantaProductKnowledge(knowledgeUrl).catch(() => emptyAtlantaProductKnowledge());
const entries = { ...existing.entries };
const nextOffers = [];
let removed = 0;
let refreshed = 0;

for (const offer of data.offers) {
  const key = flippKnowledgeKey(offer.originalName);
  const fixed = entries[key];
  const manuallyReviewed = fixed?.reviewStatus === 'reviewed' || fixed?.reviewStatus === 'codex_name_and_description_reviewed';
  const classification = manuallyReviewed && fixed?.categoryId && fixed?.descriptionZh
    ? { categoryId: fixed.categoryId, comparisonGroup: fixed.comparisonGroup, zhExplanation: sanitizeItemDescriptionZh(fixed.descriptionZh) }
    : classifyFlippItem(offer.originalName);
  if (!classification) {
    removed += 1;
    continue;
  }
  const entry = manuallyReviewed ? fixed : {
    originalName: offer.originalName,
    categoryId: classification.categoryId,
    comparisonGroup: classification.comparisonGroup || `${classification.categoryId}_other`,
    descriptionZh: sanitizeItemDescriptionZh(classification.zhExplanation),
    authoredBy: 'Codex',
    reviewStatus: 'name_reviewed_image_pending',
    imageReviewed: false,
    evidence: {
      originalNameReviewed: true,
      imageUrl: offer.imageUrl || null,
    },
  };
  entry.descriptionZh = sanitizeItemDescriptionZh(entry.descriptionZh);
  entries[key] = entry;
  nextOffers.push({
    ...offer,
    productNameZh: entry.productNameZh || offer.productNameZh || null,
    categoryId: entry.categoryId,
    comparisonGroup: entry.comparisonGroup || `${entry.categoryId}_other`,
    zhExplanation: entry.descriptionZh,
    descriptionSource: 'codex_product_knowledge',
    descriptionAuthor: entry.authoredBy || 'Codex',
    productKnowledgeKey: key,
    descriptionEvidence: {
      originalName: offer.originalName,
      imageUrl: offer.imageUrl || null,
      imageReviewed: Boolean(entry.imageReviewed),
    },
  });
  refreshed += 1;
}

const usedKeys = new Set(nextOffers.map(offer => offer.productKnowledgeKey));
const compactEntries = Object.fromEntries(Object.entries(entries)
  .filter(([key]) => usedKeys.has(key))
  .sort(([a], [b]) => a.localeCompare(b)));
const updatedAt = new Date().toISOString();
const knowledge = {
  schemaVersion: 1,
  maintainedBy: 'Codex',
  updatedAt,
  reviewPolicy: 'Original name is mandatory evidence. New or ambiguous products retain the image URL for Codex visual review; imageReviewed is true only after an actual visual check.',
  entries: compactEntries,
};
data.offers = nextOffers.sort((a, b) => a.storeId.localeCompare(b.storeId) || a.categoryId.localeCompare(b.categoryId) || a.price - b.price);
data.comparisonGroups = ATLANTA_COMPARISON_GROUPS;
data.metadata.productKnowledgeUpdatedAt = updatedAt;
data.metadata.contentUpdatedAt = updatedAt;
data.metadata.productKnowledgeEntries = Object.keys(compactEntries).length;

await fs.writeFile(knowledgeUrl, `${JSON.stringify(knowledge, null, 2)}\n`);
await fs.writeFile(offersUrl, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Atlanta knowledge: ${Object.keys(compactEntries).length} reusable products; refreshed ${refreshed} offers; removed ${removed} non-grocery matches.`);
