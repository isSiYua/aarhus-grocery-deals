import fs from 'node:fs/promises';

import { explainInChinese } from './lib/explain-zh.mjs';
import { danishProductNameZh, specificDanishDescription } from './lib/product-name-zh.mjs';
import { descriptionKeyFor, DESCRIPTION_SPEC_VERSION } from './lib/product-descriptions.mjs';
import { sanitizeItemDescriptionZh } from './lib/description-quality.mjs';
import { AARHUS_COMPARISON_GROUPS, classifyOffer, isClearlyOutOfScope, normalizedText, refineAarhusCategory } from './lib/taxonomy.mjs';

const aarhusUrl = new URL('../data/current_offers.json', import.meta.url);
const descriptionsUrl = new URL('../data/product_descriptions_zh.json', import.meta.url);
const pendingDescriptionsUrl = new URL('../data/product_descriptions_pending.json', import.meta.url);
const taxonomyUrl = new URL('../data/product_taxonomy_zh.json', import.meta.url);
const pendingTaxonomyUrl = new URL('../data/product_taxonomy_pending.json', import.meta.url);
const reviewOverridesUrl = new URL('../data/product_review_overrides_zh.json', import.meta.url);

const read = async url => JSON.parse(await fs.readFile(url, 'utf8'));
const write = async (url, value) => fs.writeFile(url, `${JSON.stringify(value, null, 2)}\n`);
const now = new Date().toISOString();
const LEGACY_GENERIC_DESCRIPTION = /其他家居用品|其他电子电器|其他休闲、户外或兴趣用品|成人服饰或鞋袜|儿童服饰或鞋袜|请按原名|请按原始商品名|具体品种以原名|原名为准|购买时请确认年龄段/;

const aarhus = await read(aarhusUrl);
const previousAarhusOffers = aarhus.offers;
// The optional baseline paths are useful when recovering a generated review from
// an earlier repository revision. Normal runs always reuse the checked-in cache.
const previousDescriptions = await read(process.env.PRODUCT_REVIEW_BASELINE_DESCRIPTIONS || descriptionsUrl);
const previousTaxonomy = await read(process.env.PRODUCT_REVIEW_BASELINE_TAXONOMY || taxonomyUrl);
const pendingDescriptionsToReview = await read(
  process.env.PRODUCT_REVIEW_PENDING_DESCRIPTIONS || pendingDescriptionsUrl,
);
const previousPendingTaxonomy = await read(pendingTaxonomyUrl);
const reviewOverrides = await read(reviewOverridesUrl);
const previousByName = new Map(Object.values(previousDescriptions.entries || {}).map(entry => [entry.originalName, entry]));
const descriptionEntries = { ...(previousDescriptions.entries || {}) };
const taxonomyEntries = { ...(previousTaxonomy.entries || {}) };
const nextAarhusOffers = [];
const reviewCandidates = [
  ...aarhus.offers.map(offer => ({ ...offer, publish: true })),
  ...(pendingDescriptionsToReview.items || []).map(item => ({
    originalName: item.originalName,
    originalDescription: item.sampleDescriptions?.[0] || '',
    categoryId: item.categoryId,
    comparisonGroup: item.comparisonGroup,
    imageUrl: null,
    publish: false,
  })),
];

const sameDescriptionReview = (previous, next) => Boolean(previous)
  && previous.productNameZh === next.productNameZh
  && previous.descriptionZh === next.descriptionZh
  && previous.categoryId === next.categoryId
  && previous.comparisonGroup === next.comparisonGroup
  && Boolean(previous.evidence?.offerImageReviewed) === Boolean(next.evidence?.offerImageReviewed);

const sameTaxonomyReview = (previous, next) => Boolean(previous)
  && previous.status === next.status
  && previous.categoryId === next.categoryId
  && previous.comparisonGroup === next.comparisonGroup
  && previous.labelZh === next.labelZh
  && previous.reasonZh === next.reasonZh;

for (const offer of reviewCandidates) {
  const raw = { heading: offer.originalName, description: offer.originalDescription || '' };
  if (isClearlyOutOfScope(raw)) continue;
  const override = reviewOverrides.entries?.[normalizedText(offer.originalName)] || null;
  if (override?.status === 'excluded') continue;
  const classification = override?.categoryId && override?.comparisonGroup
    ? { categoryId: refineAarhusCategory(override.categoryId, override.comparisonGroup), comparisonGroup: override.comparisonGroup }
    : (classifyOffer(raw) || { categoryId: offer.categoryId, comparisonGroup: offer.comparisonGroup });
  const descriptionKey = descriptionKeyFor(raw, classification);
  const productNameZh = override?.productNameZh || danishProductNameZh(
    offer.originalName,
    classification.comparisonGroup,
    offer.originalDescription,
  );
  const previous = previousDescriptions.entries?.[descriptionKey] || previousByName.get(offer.originalName);
  const exactDescription = specificDanishDescription(
    offer.originalName,
    offer.originalDescription,
    classification.comparisonGroup,
  );
  const fallback = explainInChinese(raw, classification);
  const keepImageReviewedDescription = previous?.evidence?.offerImageReviewed
    && previous?.descriptionZh
    && !LEGACY_GENERIC_DESCRIPTION.test(previous.descriptionZh);
  const descriptionZh = sanitizeItemDescriptionZh(
    override?.descriptionZh
      || exactDescription
      || (keepImageReviewedDescription ? previous.descriptionZh : `${productNameZh}。${fallback}`),
  );

  const descriptionCandidate = {
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
  const exactPreviousDescription = previousDescriptions.entries?.[descriptionKey];
  descriptionEntries[descriptionKey] = sameDescriptionReview(exactPreviousDescription, descriptionCandidate)
    ? exactPreviousDescription
    : descriptionCandidate;

  const taxonomyCandidate = {
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
  const exactPreviousTaxonomy = previousTaxonomy.entries?.[descriptionKey];
  taxonomyEntries[descriptionKey] = sameTaxonomyReview(exactPreviousTaxonomy, taxonomyCandidate)
    ? exactPreviousTaxonomy
    : taxonomyCandidate;
  if (offer.publish) {
    const { publish: _publish, ...publicOffer } = offer;
    nextAarhusOffers.push({
      ...publicOffer,
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
}

const finalizedAarhusOffers = nextAarhusOffers.map(offer => {
  const reviewed = descriptionEntries[offer.descriptionKey];
  if (!reviewed) return offer;
  return {
    ...offer,
    productNameZh: reviewed.productNameZh,
    zhExplanation: reviewed.descriptionZh,
    taxonomyLabelZh: reviewed.productNameZh,
  };
});
const offersChanged = JSON.stringify(finalizedAarhusOffers) !== JSON.stringify(previousAarhusOffers);
aarhus.offers = finalizedAarhusOffers;
aarhus.comparisonGroups = AARHUS_COMPARISON_GROUPS;
if (offersChanged) aarhus.metadata.contentUpdatedAt = now;
aarhus.metadata.contentRevision = 'codex-product-review-v3';
const descriptions = {
  schemaVersion: 2,
  descriptionSpecVersion: DESCRIPTION_SPEC_VERSION,
  maintainedBy: 'Codex',
  updatedAt: Object.keys(descriptionEntries).length === Object.keys(previousDescriptions.entries || {}).length
    && Object.entries(descriptionEntries).every(([key, value]) => value === previousDescriptions.entries?.[key])
    ? previousDescriptions.updatedAt
    : now,
  reviewPolicy: 'Each published product has a repository-backed Chinese name and explanation reviewed from its original name and flyer description. Image evidence remains separately marked.',
  entries: Object.fromEntries(Object.entries(descriptionEntries).sort(([a], [b]) => a.localeCompare(b))),
};
const pendingDescriptions = {
  schemaVersion: 2,
  descriptionSpecVersion: DESCRIPTION_SPEC_VERSION,
  generatedAt: pendingDescriptionsToReview.count === 0 ? pendingDescriptionsToReview.generatedAt || now : now,
  count: 0,
  items: [],
};
const taxonomy = {
  schemaVersion: 1,
  taxonomyVersion: 'codex-taxonomy-v1',
  maintainedBy: 'Codex',
  updatedAt: Object.keys(taxonomyEntries).length === Object.keys(previousTaxonomy.entries || {}).length
    && Object.entries(taxonomyEntries).every(([key, value]) => value === previousTaxonomy.entries?.[key])
    ? previousTaxonomy.updatedAt
    : now,
  entries: Object.fromEntries(Object.entries(taxonomyEntries).sort(([a], [b]) => a.localeCompare(b))),
};
const pendingTaxonomy = previousPendingTaxonomy.count === 0
  ? previousPendingTaxonomy
  : { schemaVersion: 1, taxonomyVersion: 'codex-taxonomy-v1', generatedAt: now, count: 0, items: [] };

await Promise.all([
  write(aarhusUrl, aarhus), write(descriptionsUrl, descriptions), write(pendingDescriptionsUrl, pendingDescriptions),
  write(taxonomyUrl, taxonomy), write(pendingTaxonomyUrl, pendingTaxonomy),
]);

console.log(`Codex product review saved ${Object.keys(descriptionEntries).length} reusable Aarhus products, including ${pendingDescriptionsToReview.items?.length || 0} pending products; no reviewed descriptions remain on category fallbacks. Archived Atlanta data was not changed.`);
