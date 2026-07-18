import fs from 'node:fs/promises';
import { descriptionKeyFor } from './lib/product-descriptions.mjs';
const data = JSON.parse(await fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'));
const atlanta = JSON.parse(await fs.readFile(new URL('../data/atlanta_offers.json', import.meta.url), 'utf8'));
const atlantaKnowledge = JSON.parse(await fs.readFile(new URL('../data/atlanta_product_knowledge_zh.json', import.meta.url), 'utf8'));
const descriptionCache = JSON.parse(await fs.readFile(new URL('../data/product_descriptions_zh.json', import.meta.url), 'utf8'));
const descriptionPending = JSON.parse(await fs.readFile(new URL('../data/product_descriptions_pending.json', import.meta.url), 'utf8'));
const identityHistory = JSON.parse(await fs.readFile(new URL('../data/product_identity_history.json', import.meta.url), 'utf8'));
const productTaxonomy = JSON.parse(await fs.readFile(new URL('../data/product_taxonomy_zh.json', import.meta.url), 'utf8'));
const taxonomyPending = JSON.parse(await fs.readFile(new URL('../data/product_taxonomy_pending.json', import.meta.url), 'utf8'));
const requiredTop = ['metadata','stores','categories','comparisonGroups','offers'];
for (const key of requiredTop) if (!(key in data)) throw new Error(`Missing top-level key: ${key}`);
if ('history' in data) throw new Error('Archive history must stay in data/history.json, not current_offers.json');
const storeIds = new Set(data.stores.map(s => s.id));
const categoryIds = new Set(data.categories.map(c => c.id));
const ids = new Set();
for (const [index, offer] of data.offers.entries()) {
  for (const key of ['canonicalKey','storeId','originalName','productNameZh','zhExplanation','descriptionKey','descriptionSource','categoryId','comparisonGroup','price','validUntil']) {
    if (offer[key] === undefined || offer[key] === null || offer[key] === '') throw new Error(`Offer ${index} missing ${key}`);
  }
  if (ids.has(offer.canonicalKey)) throw new Error(`Duplicate canonicalKey: ${offer.canonicalKey}`);
  ids.add(offer.canonicalKey);
  if (!storeIds.has(offer.storeId)) throw new Error(`Unknown store ${offer.storeId}`);
  if (!categoryIds.has(offer.categoryId)) throw new Error(`Unknown category ${offer.categoryId}`);
  if (!data.comparisonGroups[offer.comparisonGroup]) throw new Error(`Unknown comparison group ${offer.comparisonGroup}`);
  if (offer.categoryId === 'drinks' && !/coca[- ]?cola zero|coke zero|sprite zero/i.test(offer.originalName)) throw new Error(`Disallowed drink: ${offer.originalName}`);
  if (offer.descriptionSource !== 'codex_cache') throw new Error(`Published Aarhus description is not individually reviewed: ${offer.canonicalKey}`);
  const canonicalDescriptionKey = descriptionKeyFor(offer, offer);
  const cachedDescription = descriptionCache.entries?.[offer.descriptionKey] || descriptionCache.entries?.[canonicalDescriptionKey];
  if (!cachedDescription || cachedDescription.descriptionZh !== offer.zhExplanation || cachedDescription.productNameZh !== offer.productNameZh) throw new Error(`Codex description is not backed by per-product cache: ${offer.canonicalKey}`);
  if (!['unlocated','direct','verified'].includes(offer.sourceLocation?.status)) throw new Error(`Invalid source location status: ${offer.canonicalKey}`);
  if (offer.sourceLocation?.status === 'verified' && (!Number.isInteger(offer.sourceLocation.pageNumber) || offer.sourceLocation.pageNumber < 1)) throw new Error(`Invalid verified source location: ${offer.canonicalKey}`);
}

if (descriptionCache.schemaVersion !== 2 || descriptionCache.descriptionSpecVersion !== 'zh-product-v3' || descriptionCache.maintainedBy !== 'Codex' || typeof descriptionCache.entries !== 'object') throw new Error('Invalid product description cache');
if (descriptionPending.schemaVersion !== 2 || descriptionPending.descriptionSpecVersion !== 'zh-product-v3' || !Array.isArray(descriptionPending.items) || descriptionPending.count !== descriptionPending.items.length) throw new Error('Invalid pending description queue');
if (descriptionPending.count !== 0) throw new Error('Published Aarhus products still have descriptions pending Codex review');
if (!data.metadata.contentUpdatedAt) throw new Error('Aarhus content update time is missing');
const pendingKeys = new Set();
for (const item of descriptionPending.items) {
  if (!item.descriptionKey || !item.originalName || !item.categoryId || !item.comparisonGroup) throw new Error('Incomplete pending description item');
  if (pendingKeys.has(item.descriptionKey)) throw new Error(`Duplicate pending description: ${item.descriptionKey}`);
  if (descriptionCache.entries[item.descriptionKey]) throw new Error(`Cached description still pending: ${item.descriptionKey}`);
  pendingKeys.add(item.descriptionKey);
}
const publishedDescriptionFiles = JSON.stringify({ descriptionCache, descriptionPending });
if (/sk-[A-Za-z0-9_-]{20,}|OPENAI_API_KEY|api[_-]?key/i.test(publishedDescriptionFiles)) throw new Error('Possible API secret in published description data');
if (identityHistory.schemaVersion !== 1 || typeof identityHistory.products !== 'object') throw new Error('Invalid product identity history');
for (const offer of data.offers) if (!identityHistory.products[offer.descriptionKey]) throw new Error(`Offer missing stable identity history: ${offer.canonicalKey}`);
if (productTaxonomy.schemaVersion !== 1 || productTaxonomy.taxonomyVersion !== 'codex-taxonomy-v1' || productTaxonomy.maintainedBy !== 'Codex' || typeof productTaxonomy.entries !== 'object') throw new Error('Invalid fixed product taxonomy');
if (taxonomyPending.schemaVersion !== 1 || taxonomyPending.taxonomyVersion !== 'codex-taxonomy-v1' || !Array.isArray(taxonomyPending.items) || taxonomyPending.count !== taxonomyPending.items.length) throw new Error('Invalid pending taxonomy queue');
for (const [key, entry] of Object.entries(productTaxonomy.entries)) {
  if (entry.status === 'excluded') continue;
  if (!categoryIds.has(entry.categoryId) || !data.comparisonGroups[entry.comparisonGroup]) throw new Error(`Invalid fixed taxonomy entry: ${key}`);
  if (!['reviewed','pending_codex_review'].includes(entry.reviewStatus)) throw new Error(`Invalid taxonomy review status: ${key}`);
  if (entry.reviewStatus === 'reviewed' && (!entry.labelZh || !entry.reasonZh || entry.authoredBy !== 'Codex')) throw new Error(`Incomplete Codex taxonomy review: ${key}`);
}
for (const offer of data.offers) {
  const entry = productTaxonomy.entries[offer.descriptionKey];
  if (!entry || entry.status === 'excluded') throw new Error(`Published offer is not backed by fixed taxonomy: ${offer.canonicalKey}`);
  if (entry.categoryId !== offer.categoryId || entry.comparisonGroup !== offer.comparisonGroup) throw new Error(`Published taxonomy differs from fixed knowledge: ${offer.canonicalKey}`);
}
const fruitVegetableText = data.offers.filter(offer => ['fruit','vegetables'].includes(offer.categoryId)).map(offer => offer.originalName).join(' | ');
if (/citronella|\blys\b|rosé|chokobanan|salatost|tomatkniv|majskylling|hvidløgsflutes|long ribs|tomatkonserves/i.test(fruitVegetableText)) throw new Error('Non-produce item leaked into fruit or vegetables');

if (!atlanta.metadata || !atlanta.metadata.contentUpdatedAt || !Array.isArray(atlanta.offers) || !Array.isArray(atlanta.flyers) || !Array.isArray(atlanta.categories) || !atlanta.comparisonGroups) throw new Error('Invalid Atlanta data shape');
const atlantaStoreIds = new Set(['kroger-howell-mill', 'publix-howell-mill', 'whole-foods-midtown', 'target-midtown', 'walmart-mlk']);
const atlantaCategoryIds = new Set(atlanta.categories.map(category => category.id));
const atlantaIds = new Set();
if (atlantaKnowledge.schemaVersion !== 1 || atlantaKnowledge.maintainedBy !== 'Codex' || typeof atlantaKnowledge.entries !== 'object') throw new Error('Invalid Atlanta product knowledge');
const emptyGenericDescription = /^(蔬菜商品|水果商品|肉类或熟食优惠|常温食品或调料|冷冻食品或方便餐|乳制品或鸡蛋优惠|蔬菜水果类优惠|饮料优惠|鱼类或海鲜优惠|面包或烘焙食品优惠|冷冻食品优惠|主食、罐头或调味品优惠|零食或甜品优惠)/;
for (const offer of data.offers) if (emptyGenericDescription.test(offer.zhExplanation)) throw new Error(`Generic Aarhus description is not publishable: ${offer.canonicalKey}`);
for (const [index, offer] of atlanta.offers.entries()) {
  for (const key of ['canonicalKey','storeId','originalName','productNameZh','zhExplanation','descriptionSource','productKnowledgeKey','categoryId','price','currency','validFrom','validUntil','sourceUrl','itemId']) {
    if (offer[key] === undefined || offer[key] === null || offer[key] === '') throw new Error(`Atlanta offer ${index} missing ${key}`);
  }
  if (atlantaIds.has(offer.canonicalKey)) throw new Error(`Duplicate Atlanta canonicalKey: ${offer.canonicalKey}`);
  atlantaIds.add(offer.canonicalKey);
  if (!atlantaStoreIds.has(offer.storeId)) throw new Error(`Unknown Atlanta store ${offer.storeId}`);
  if (!atlantaCategoryIds.has(offer.categoryId) || !atlanta.comparisonGroups[offer.comparisonGroup]) throw new Error(`Invalid Atlanta category or comparison group: ${offer.canonicalKey}`);
  const knowledge = atlantaKnowledge.entries[offer.productKnowledgeKey];
  if (offer.descriptionSource !== 'codex_product_knowledge' || !knowledge || knowledge.descriptionZh !== offer.zhExplanation || knowledge.productNameZh !== offer.productNameZh || knowledge.categoryId !== offer.categoryId || knowledge.comparisonGroup !== offer.comparisonGroup) throw new Error(`Atlanta offer is not backed by Codex product knowledge: ${offer.canonicalKey}`);
  if (emptyGenericDescription.test(offer.zhExplanation)) throw new Error(`Generic Atlanta description is not publishable: ${offer.canonicalKey}`);
  if (offer.currency !== 'USD' || !Number.isFinite(offer.price) || offer.price <= 0) throw new Error(`Invalid Atlanta price: ${offer.canonicalKey}`);
  const expectedFlyerUrl = `https://flipp.com/en-us/atlanta-ga/flyer/${offer.flyerId}?postal_code=30318`;
  const expectedItemPrefix = `https://flipp.com/en-us/atlanta-ga/item/${offer.itemId}-`;
  if (!offer.sourceUrl.startsWith(expectedItemPrefix) || !offer.sourceUrl.endsWith('?postal_code=30318')) throw new Error(`Atlanta item URL is not pinned to 30318: ${offer.canonicalKey}`);
  if (offer.flyerUrl !== expectedFlyerUrl) throw new Error(`Atlanta flyer URL is not pinned to 30318: ${offer.canonicalKey}`);
  if (offer.sourceLocation?.status !== 'direct') throw new Error(`Invalid Atlanta source status: ${offer.canonicalKey}`);
  if (offer.sourceLocation.pageNumber !== null) throw new Error(`Atlanta page number must not be inferred: ${offer.canonicalKey}`);
  if (offer.sourceLocation.deepLink !== offer.sourceUrl || offer.sourceLocation.method !== 'flipp-item-id') throw new Error(`Atlanta direct source missing exact item link: ${offer.canonicalKey}`);
}
for (const flyer of atlanta.flyers) {
  const expectedFlyerUrl = `https://flipp.com/en-us/atlanta-ga/flyer/${flyer.id}?postal_code=30318`;
  if (flyer.url !== expectedFlyerUrl) throw new Error(`Atlanta flyer directory URL is not pinned to 30318: ${flyer.storeId}`);
}
console.log(`Validated ${data.offers.length} Aarhus offers across ${data.stores.length} stores, ${atlanta.offers.length} Atlanta offers backed by ${Object.keys(atlantaKnowledge.entries).length} reusable products, ${Object.keys(descriptionCache.entries).length} Codex descriptions, ${Object.values(productTaxonomy.entries).filter(entry => entry.reviewStatus === 'reviewed').length} Codex-reviewed taxonomies, ${taxonomyPending.count} pending taxonomy reviews, and ${Object.keys(identityHistory.products).length} stable product identities.`);
