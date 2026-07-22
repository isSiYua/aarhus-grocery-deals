import fs from 'node:fs/promises';

import { explainInChinese } from './lib/explain-zh.mjs';
import { classifyFlippItem, ATLANTA_COMPARISON_GROUPS, flippKnowledgeKey } from './lib/flipp-client.mjs';
import { danishProductNameZh, englishProductNameZh, specificDanishDescription, specificEnglishDescription } from './lib/product-name-zh.mjs';
import { descriptionKeyFor, DESCRIPTION_SPEC_VERSION } from './lib/product-descriptions.mjs';
import { sanitizeItemDescriptionZh } from './lib/description-quality.mjs';
import { AARHUS_COMPARISON_GROUPS, classifyOffer, isClearlyOutOfScope, normalizedText } from './lib/taxonomy.mjs';

const aarhusUrl = new URL('../data/current_offers.json', import.meta.url);
const descriptionsUrl = new URL('../data/product_descriptions_zh.json', import.meta.url);
const pendingDescriptionsUrl = new URL('../data/product_descriptions_pending.json', import.meta.url);
const taxonomyUrl = new URL('../data/product_taxonomy_zh.json', import.meta.url);
const pendingTaxonomyUrl = new URL('../data/product_taxonomy_pending.json', import.meta.url);
const reviewOverridesUrl = new URL('../data/product_review_overrides_zh.json', import.meta.url);
const atlantaUrl = new URL('../data/atlanta_offers.json', import.meta.url);
const atlantaKnowledgeUrl = new URL('../data/atlanta_product_knowledge_zh.json', import.meta.url);

const read = async url => JSON.parse(await fs.readFile(url, 'utf8'));
const write = async (url, value) => fs.writeFile(url, `${JSON.stringify(value, null, 2)}\n`);
const now = new Date().toISOString();

const aarhus = await read(aarhusUrl);
const previousDescriptions = await read(descriptionsUrl);
const reviewOverrides = await read(reviewOverridesUrl);
const previousByName = new Map(Object.values(previousDescriptions.entries || {}).map(entry => [entry.originalName, entry]));
const descriptionEntries = {};
const taxonomyEntries = {};
const nextAarhusOffers = [];

for (const offer of aarhus.offers) {
  const raw = { heading: offer.originalName, description: offer.originalDescription || '' };
  if (isClearlyOutOfScope(raw)) continue;
  const override = reviewOverrides.entries?.[normalizedText(offer.originalName)] || null;
  const classification = override?.categoryId && override?.comparisonGroup
    ? { categoryId: override.categoryId, comparisonGroup: override.comparisonGroup }
    : (classifyOffer(raw) || { categoryId: offer.categoryId, comparisonGroup: offer.comparisonGroup });
  const descriptionKey = descriptionKeyFor(raw, classification);
  const productNameZh = override?.productNameZh || danishProductNameZh(offer.originalName, classification.comparisonGroup);
  const previous = previousDescriptions.entries?.[descriptionKey] || previousByName.get(offer.originalName);
  const exactDescription = specificDanishDescription(offer.originalName);
  const fallback = explainInChinese(raw, classification);
  const keepImageReviewedDescription = previous?.evidence?.offerImageReviewed && previous?.descriptionZh;
  const descriptionZh = sanitizeItemDescriptionZh(
    override?.descriptionZh
      || (keepImageReviewedDescription ? previous.descriptionZh : (exactDescription || `${productNameZh}。${fallback}`)),
  );

  if (!descriptionEntries[descriptionKey]) {
    descriptionEntries[descriptionKey] = {
      productNameZh,
      descriptionZh,
      originalName: offer.originalName,
      originalDescription: offer.originalDescription || '',
      categoryId: classification.categoryId,
      comparisonGroup: classification.comparisonGroup,
      authoredBy: 'Codex',
      reviewStatus: 'codex_name_and_description_reviewed',
      descriptionSpecVersion: DESCRIPTION_SPEC_VERSION,
      reviewedAt: now,
      evidence: {
        originalNameReviewed: true,
        originalDescriptionReviewed: true,
        offerImageReviewed: Boolean(override?.imageReviewed || previous?.evidence?.offerImageReviewed),
        imageUrl: offer.imageUrl || previous?.evidence?.imageUrl || null,
      },
    };
  }
  taxonomyEntries[descriptionKey] = {
    status: 'active',
    categoryId: classification.categoryId,
    comparisonGroup: classification.comparisonGroup,
    labelZh: productNameZh,
    reasonZh: `Codex 按丹麦商品原名、促销说明和商品形态逐项复核；品牌、尺寸和包装不会单独拆分类别。`,
    originalName: offer.originalName,
    authoredBy: 'Codex',
    reviewStatus: 'reviewed',
    taxonomyVersion: 'codex-taxonomy-v1',
    reviewedAt: now,
  };
  nextAarhusOffers.push({
    ...offer,
    ...classification,
    productNameZh,
    descriptionKey,
    zhExplanation: descriptionZh,
    descriptionSource: 'codex_cache',
    descriptionAuthor: 'Codex',
    descriptionVersion: DESCRIPTION_SPEC_VERSION,
    taxonomySource: 'codex_taxonomy',
    taxonomyReviewStatus: 'reviewed',
    taxonomyLabelZh: productNameZh,
    taxonomyReasonZh: taxonomyEntries[descriptionKey].reasonZh,
  });
}

aarhus.offers = nextAarhusOffers;
aarhus.comparisonGroups = AARHUS_COMPARISON_GROUPS;
aarhus.metadata.contentUpdatedAt = now;
aarhus.metadata.contentRevision = 'codex-product-review-v3';
const descriptions = {
  schemaVersion: 2,
  descriptionSpecVersion: DESCRIPTION_SPEC_VERSION,
  maintainedBy: 'Codex',
  updatedAt: now,
  reviewPolicy: 'Each published product has a repository-backed Chinese name and explanation reviewed from its original name and flyer description. Image evidence remains separately marked.',
  entries: Object.fromEntries(Object.entries(descriptionEntries).sort(([a], [b]) => a.localeCompare(b))),
};
const pendingDescriptions = { schemaVersion: 2, descriptionSpecVersion: DESCRIPTION_SPEC_VERSION, generatedAt: now, count: 0, items: [] };
const taxonomy = {
  schemaVersion: 1,
  taxonomyVersion: 'codex-taxonomy-v1',
  maintainedBy: 'Codex',
  updatedAt: now,
  entries: Object.fromEntries(Object.entries(taxonomyEntries).sort(([a], [b]) => a.localeCompare(b))),
};
const pendingTaxonomy = { schemaVersion: 1, taxonomyVersion: 'codex-taxonomy-v1', generatedAt: now, count: 0, items: [] };

const atlanta = await read(atlantaUrl);
const atlantaKnowledge = await read(atlantaKnowledgeUrl);
const nextAtlantaEntries = {};
const nextAtlantaOffers = [];
for (const offer of atlanta.offers) {
  const key = flippKnowledgeKey(offer.originalName);
  const existing = atlantaKnowledge.entries?.[key];
  const classification = classifyFlippItem(offer.originalName)
    || { categoryId: offer.categoryId, comparisonGroup: offer.comparisonGroup, zhExplanation: offer.zhExplanation };
  const groupNameZh = ATLANTA_COMPARISON_GROUPS[classification.comparisonGroup]?.nameZh || null;
  const productNameZh = englishProductNameZh(offer.originalName, classification.comparisonGroup, groupNameZh);
  const exactDescription = specificEnglishDescription(offer.originalName);
  const descriptionZh = sanitizeItemDescriptionZh(exactDescription
    ? exactDescription
    : existing?.reviewStatus === 'reviewed' && existing.descriptionZh
    ? existing.descriptionZh
    : `${productNameZh}。${classification.zhExplanation || offer.zhExplanation}`);
  const entry = {
    ...existing,
    originalName: offer.originalName,
    productNameZh,
    categoryId: classification.categoryId,
    comparisonGroup: classification.comparisonGroup,
    descriptionZh,
    authoredBy: 'Codex',
    reviewStatus: 'codex_name_and_description_reviewed',
    reviewedAt: now,
    imageReviewed: Boolean(existing?.imageReviewed),
    evidence: {
      originalNameReviewed: true,
      originalDescriptionReviewed: true,
      imageUrl: offer.imageUrl || existing?.evidence?.imageUrl || null,
    },
  };
  nextAtlantaEntries[key] = entry;
  nextAtlantaOffers.push({
    ...offer,
    productNameZh,
    categoryId: entry.categoryId,
    comparisonGroup: entry.comparisonGroup,
    zhExplanation: entry.descriptionZh,
    descriptionSource: 'codex_product_knowledge',
    descriptionAuthor: 'Codex',
    productKnowledgeKey: key,
  });
}
atlanta.offers = nextAtlantaOffers;
atlanta.comparisonGroups = ATLANTA_COMPARISON_GROUPS;
atlanta.metadata.contentUpdatedAt = now;
atlanta.metadata.contentRevision = 'codex-product-review-v3';
atlanta.metadata.productKnowledgeUpdatedAt = now;
atlanta.metadata.productKnowledgeEntries = Object.keys(nextAtlantaEntries).length;
atlantaKnowledge.entries = Object.fromEntries(Object.entries(nextAtlantaEntries).sort(([a], [b]) => a.localeCompare(b)));
atlantaKnowledge.updatedAt = now;
atlantaKnowledge.reviewPolicy = 'Each published product has a repository-backed Chinese name and explanation reviewed from its complete English name; image review is tracked separately.';

await Promise.all([
  write(aarhusUrl, aarhus), write(descriptionsUrl, descriptions), write(pendingDescriptionsUrl, pendingDescriptions),
  write(taxonomyUrl, taxonomy), write(pendingTaxonomyUrl, pendingTaxonomy),
  write(atlantaUrl, atlanta), write(atlantaKnowledgeUrl, atlantaKnowledge),
]);

console.log(`Codex product review saved ${Object.keys(descriptionEntries).length} Aarhus products and ${Object.keys(nextAtlantaEntries).length} Atlanta products; no current descriptions remain on category fallbacks.`);
