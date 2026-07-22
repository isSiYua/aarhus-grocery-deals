import fs from 'node:fs/promises';
import { DESCRIPTION_SPEC_VERSION, descriptionKeyFor } from './lib/product-descriptions.mjs';
import { explicitMultipack } from './lib/normalize.mjs';
import { assertSafePublicationText } from './lib/publication-safety.mjs';
const data = JSON.parse(await fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'));
const atlanta = JSON.parse(await fs.readFile(new URL('../data/atlanta_offers.json', import.meta.url), 'utf8'));
const atlantaKnowledge = JSON.parse(await fs.readFile(new URL('../data/atlanta_product_knowledge_zh.json', import.meta.url), 'utf8'));
const descriptionCache = JSON.parse(await fs.readFile(new URL('../data/product_descriptions_zh.json', import.meta.url), 'utf8'));
const descriptionPending = JSON.parse(await fs.readFile(new URL('../data/product_descriptions_pending.json', import.meta.url), 'utf8'));
const identityHistory = JSON.parse(await fs.readFile(new URL('../data/product_identity_history.json', import.meta.url), 'utf8'));
const productTaxonomy = JSON.parse(await fs.readFile(new URL('../data/product_taxonomy_zh.json', import.meta.url), 'utf8'));
const taxonomyPending = JSON.parse(await fs.readFile(new URL('../data/product_taxonomy_pending.json', import.meta.url), 'utf8'));
const reviewOverrides = JSON.parse(await fs.readFile(new URL('../data/product_review_overrides_zh.json', import.meta.url), 'utf8'));
const requiredTop = ['metadata','stores','categories','comparisonGroups','offers'];
for (const key of requiredTop) if (!(key in data)) throw new Error(`Missing top-level key: ${key}`);
if ('history' in data) throw new Error('Archive history must stay in data/history.json, not current_offers.json');
const storeIds = new Set(data.stores.map(s => s.id));
const categoryIds = new Set(data.categories.map(c => c.id));
const ids = new Set();
for (const store of data.stores) {
  for (const key of ['name','shortAddress','distanceLabel','membership','descriptionZh']) {
    assertSafePublicationText(store[key], `store ${store.id}.${key}`);
  }
}
for (const category of data.categories) {
  for (const key of ['nameZh','descriptionZh']) assertSafePublicationText(category[key], `category ${category.id}.${key}`);
}
for (const [groupId, group] of Object.entries(data.comparisonGroups)) {
  for (const key of ['nameZh','noteZh']) assertSafePublicationText(group[key], `comparison group ${groupId}.${key}`);
}
for (const [index, offer] of data.offers.entries()) {
  for (const key of ['canonicalKey','storeId','originalName','productNameZh','zhExplanation','descriptionKey','descriptionSource','categoryId','comparisonGroup','price','validUntil']) {
    if (offer[key] === undefined || offer[key] === null || offer[key] === '') throw new Error(`Offer ${index} missing ${key}`);
  }
  if (ids.has(offer.canonicalKey)) throw new Error(`Duplicate canonicalKey: ${offer.canonicalKey}`);
  ids.add(offer.canonicalKey);
  if (!storeIds.has(offer.storeId)) throw new Error(`Unknown store ${offer.storeId}`);
  if (!categoryIds.has(offer.categoryId)) throw new Error(`Unknown category ${offer.categoryId}`);
  if (!data.comparisonGroups[offer.comparisonGroup]) throw new Error(`Unknown comparison group ${offer.comparisonGroup}`);
  if (offer.categoryId === 'drinks' && !/^(?:zero_soda|drink_)/.test(offer.comparisonGroup)) throw new Error(`Invalid drink group: ${offer.originalName}`);
  if (offer.descriptionSource !== 'codex_cache') throw new Error(`Published Aarhus description is not individually reviewed: ${offer.canonicalKey}`);
  assertSafePublicationText(offer.productNameZh, `offer ${offer.canonicalKey}.productNameZh`);
  assertSafePublicationText(offer.zhExplanation, `offer ${offer.canonicalKey}.zhExplanation`);
  const canonicalDescriptionKey = descriptionKeyFor(offer, offer);
  const cachedDescription = descriptionCache.entries?.[offer.descriptionKey] || descriptionCache.entries?.[canonicalDescriptionKey];
  if (!cachedDescription || cachedDescription.descriptionZh !== offer.zhExplanation || cachedDescription.productNameZh !== offer.productNameZh) throw new Error(`Codex description is not backed by per-product cache: ${offer.canonicalKey}`);
  if (cachedDescription.descriptionSpecVersion !== DESCRIPTION_SPEC_VERSION || offer.descriptionVersion !== DESCRIPTION_SPEC_VERSION) throw new Error(`Published offer uses a stale description review: ${offer.canonicalKey}`);
  if (!['unlocated','direct','verified'].includes(offer.sourceLocation?.status)) throw new Error(`Invalid source location status: ${offer.canonicalKey}`);
  if (offer.sourceLocation?.status === 'verified' && (!Number.isInteger(offer.sourceLocation.pageNumber) || offer.sourceLocation.pageNumber < 1)) throw new Error(`Invalid verified source location: ${offer.canonicalKey}`);
  const multipack = explicitMultipack(offer.originalDescription, offer.perItemQuantity ?? offer.quantity, offer.perItemQuantityUnit ?? offer.quantityUnit);
  if (multipack?.ambiguous) {
    if (offer.packageComparisonStatus !== 'ambiguous_assortment' || offer.unitPriceValue !== null) throw new Error(`Ambiguous assortment has a guessed unit price: ${offer.originalName}`);
  } else if (multipack) {
    const scale = ['g', 'ml'].includes(multipack.unit) ? 1000 : 1;
    const expectedUnitPrice = offer.price / multipack.totalSize * scale;
    if (offer.packageCount !== multipack.count || offer.quantity !== multipack.totalSize || Math.abs(offer.unitPriceValue - expectedUnitPrice) > 0.01) throw new Error(`Multipack total is not reflected in unit price: ${offer.originalName}`);
  }
}

for (const [groupId, definition] of Object.entries(data.comparisonGroups)) {
  if (typeof definition.comparable !== 'boolean') throw new Error(`Aarhus comparison group missing comparable policy: ${groupId}`);
  if (/mixed|_offer$|(?:^|_)other$/.test(groupId) && definition.comparable !== false) throw new Error(`Broad Aarhus group must not calculate a global minimum: ${groupId}`);
}

const aarhusExpectedGroups = [
  [/kalkunbryst|kalkunschnitz|kalkunstrimler/i, 'turkey_breast', /overlår/i],
  [/kalkununderlår/i, 'turkey_thigh'],
  [/hakket kalkun/i, 'turkey_minced'],
  [/kalkunhakkebøf|cordon bleu af kalkun/i, 'prepared_turkey'],
];
for (const offer of data.offers) {
  if (/kalkun/i.test(offer.originalName) && /^鸡胸肉/.test(offer.productNameZh)) throw new Error(`Turkey mislabeled as chicken breast: ${offer.originalName}`);
  if (/rib ?eye|entrec[oô]te/i.test(offer.originalName) && offer.comparisonGroup !== 'beef_ribeye') throw new Error(`Ribeye choice is outside the ribeye aisle: ${offer.originalName}`);
  for (const [pattern, expectedGroup, exclusion] of aarhusExpectedGroups) {
    if (pattern.test(offer.originalName) && !exclusion?.test(offer.originalName) && offer.comparisonGroup !== expectedGroup) throw new Error(`Wrong atomic comparison group for ${offer.originalName}: expected ${expectedGroup}, got ${offer.comparisonGroup}`);
  }
}

const fineGroupChecks = [
  [/leverpostej/i, 'liver_pate', /eller|marked|mix/i],
  [/bacon.*(?:i skiver|skiveskåret)/i, 'bacon_sliced', /eller|marked|mix|leverpostej/i],
  [/bacontern|bacon i strimler/i, 'bacon_pieces', /eller|marked|mix/i],
  [/pommes frites/i, 'potato_fries'],
  [/kartoffelrösti/i, 'potato_hash_browns'],
  [/toiletpapir/i, 'paper_toilet', /eller|\/.*køkkenrulle/i],
  [/køkkenrulle/i, 'paper_kitchen', /eller|\/.*toiletpapir/i],
];
for (const offer of data.offers) {
  for (const [pattern, expectedGroup, exclusion] of fineGroupChecks) {
    if (pattern.test(offer.originalName) && !exclusion?.test(offer.originalName) && offer.comparisonGroup !== expectedGroup) throw new Error(`Wrong fine comparison group for ${offer.originalName}: expected ${expectedGroup}, got ${offer.comparisonGroup}`);
  }
}

const mixedOfferPatterns = [
  /kalkunoverlår.*schnitzel/i,
  /kyllingelårmix.*hakket kylling|kyllingelår.*spyd|kyllingevinger.*lårfilet|wings.*nuggets.*spyd/i,
  /hakket grise.*kalve.*kyllingelår/i,
  /spareribs.*pulled|pulled.*spareribs|mørbrad.*nakkefilet|grisemørbrad.*ribbensteg/i,
  /laks.*(?:rejer|ørred|krebsehaler|havtaske|fiskesalat)|(?:rejer|ørred|krebsehaler|havtaske|fiskesalat).*laks|rejer.*(?:tun|fiskepinde)|(?:tun|fiskepinde).*rejer/i,
  /tun.*(?:majs|tomater|pizzasauce)|(?:majs|tomater|pizzasauce).*tun/i,
];
for (const offer of data.offers) {
  if (mixedOfferPatterns.some(pattern => pattern.test(offer.originalName)) && data.comparisonGroups[offer.comparisonGroup].comparable !== false) throw new Error(`Mixed offer entered a lowest-price pool: ${offer.originalName} -> ${offer.comparisonGroup}`);
}

if (descriptionCache.schemaVersion !== 2 || descriptionCache.descriptionSpecVersion !== DESCRIPTION_SPEC_VERSION || descriptionCache.maintainedBy !== 'Codex' || typeof descriptionCache.entries !== 'object') throw new Error('Invalid product description cache');
for (const [key, entry] of Object.entries(descriptionCache.entries)) {
  assertSafePublicationText(entry.productNameZh, `description cache ${key}.productNameZh`);
  assertSafePublicationText(entry.descriptionZh, `description cache ${key}.descriptionZh`);
}
if (descriptionPending.schemaVersion !== 2 || descriptionPending.descriptionSpecVersion !== DESCRIPTION_SPEC_VERSION || !Array.isArray(descriptionPending.items) || descriptionPending.count !== descriptionPending.items.length) throw new Error('Invalid pending description queue');
if (!data.metadata.contentUpdatedAt) throw new Error('Aarhus content update time is missing');
const pendingKeys = new Set();
for (const item of descriptionPending.items) {
  if (!item.descriptionKey || !item.originalName || !item.categoryId || !item.comparisonGroup) throw new Error('Incomplete pending description item');
  if (pendingKeys.has(item.descriptionKey)) throw new Error(`Duplicate pending description: ${item.descriptionKey}`);
  if (descriptionCache.entries[item.descriptionKey]?.descriptionSpecVersion === DESCRIPTION_SPEC_VERSION) throw new Error(`Current cached description still pending: ${item.descriptionKey}`);
  if (data.offers.some(offer => offer.descriptionKey === item.descriptionKey)) throw new Error(`Pending description was published: ${item.descriptionKey}`);
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
  assertSafePublicationText(entry.labelZh, `taxonomy ${key}.labelZh`);
  assertSafePublicationText(entry.reasonZh, `taxonomy ${key}.reasonZh`);
  if (!categoryIds.has(entry.categoryId) || !data.comparisonGroups[entry.comparisonGroup]) throw new Error(`Invalid fixed taxonomy entry: ${key}`);
  if (!['reviewed','pending_codex_review'].includes(entry.reviewStatus)) throw new Error(`Invalid taxonomy review status: ${key}`);
  if (entry.reviewStatus === 'reviewed' && (!entry.labelZh || !entry.reasonZh || entry.authoredBy !== 'Codex')) throw new Error(`Incomplete Codex taxonomy review: ${key}`);
}
for (const [key, entry] of Object.entries(reviewOverrides.entries || {})) {
  assertSafePublicationText(entry.productNameZh, `review override ${key}.productNameZh`);
  assertSafePublicationText(entry.descriptionZh, `review override ${key}.descriptionZh`);
}
for (const offer of data.offers) {
  const entry = productTaxonomy.entries[offer.descriptionKey];
  if (!entry || entry.status === 'excluded') throw new Error(`Published offer is not backed by fixed taxonomy: ${offer.canonicalKey}`);
  if (entry.categoryId !== offer.categoryId || entry.comparisonGroup !== offer.comparisonGroup) throw new Error(`Published taxonomy differs from fixed knowledge: ${offer.canonicalKey}`);
}
const fruitVegetableText = data.offers.filter(offer => ['fruit','vegetables'].includes(offer.categoryId)).map(offer => offer.originalName).join(' | ');
if (/citronella|\blys\b|rosé|chokobanan|salatost|tomatkniv|majskylling|hvidløgsflutes|long ribs|tomatkonserves/i.test(fruitVegetableText)) throw new Error('Non-produce item leaked into fruit or vegetables');

if (!atlanta.metadata || !atlanta.metadata.contentUpdatedAt || !Array.isArray(atlanta.offers) || !Array.isArray(atlanta.flyers) || !Array.isArray(atlanta.categories) || !atlanta.comparisonGroups) throw new Error('Invalid Atlanta data shape');
if (atlanta.metadata.archived !== true || !atlanta.metadata.archivedAt) throw new Error('Atlanta data must remain an explicitly frozen archive');
const atlantaStoreIds = new Set(['kroger-howell-mill', 'publix-howell-mill', 'whole-foods-midtown', 'target-midtown', 'walmart-mlk']);
const atlantaCategoryIds = new Set(atlanta.categories.map(category => category.id));
const atlantaIds = new Set();
if (atlantaKnowledge.schemaVersion !== 1 || atlantaKnowledge.maintainedBy !== 'Codex' || typeof atlantaKnowledge.entries !== 'object') throw new Error('Invalid Atlanta product knowledge');
if (atlantaKnowledge.archived !== true) throw new Error('Atlanta product knowledge must remain archived');
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
for (const [groupId, definition] of Object.entries(atlanta.comparisonGroups)) {
  if (typeof definition.comparable !== 'boolean') throw new Error(`Atlanta comparison group missing comparable policy: ${groupId}`);
  if (/mixed|(?:^|_)other$/.test(groupId) && definition.comparable !== false) throw new Error(`Broad Atlanta group must not calculate a global minimum: ${groupId}`);
}
const atlantaExpectedGroups = new Map([
  ['Applegate Naturals Uncured Turkey Bacon', 'bacon_turkey_sliced'],
  ["Boar's Head Ovengold Roasted Turkey Breast", 'meat_turkey_deli'],
  ['Private Selection Black Forest Ham', 'meat_ham_deli'],
  ['Hormel Pepperoni', 'meat_pepperoni'],
  ['Publix Sweet Italian Sausage', 'sausage_pork'],
  ['Publix Chicken Tender Whole Sub', 'meat_chicken_sandwich'],
]);
for (const [name, expectedGroup] of atlantaExpectedGroups) {
  const matches = atlanta.offers.filter(offer => offer.originalName.replace('®', '') === name);
  // Weekly flyers rotate. Validate these regression products when present; the
  // classifier unit tests keep the same examples covered between promotions.
  for (const offer of matches) if (offer.comparisonGroup !== expectedGroup) throw new Error(`Wrong Atlanta comparison group for ${name}: ${offer.comparisonGroup}`);
}
for (const flyer of atlanta.flyers) {
  const expectedFlyerUrl = `https://flipp.com/en-us/atlanta-ga/flyer/${flyer.id}?postal_code=30318`;
  if (flyer.url !== expectedFlyerUrl) throw new Error(`Atlanta flyer directory URL is not pinned to 30318: ${flyer.storeId}`);
}
console.log(`Validated ${data.offers.length} Aarhus offers across ${data.stores.length} stores, frozen ${atlanta.offers.length}-offer Atlanta archive, ${Object.keys(descriptionCache.entries).length} Codex descriptions, ${Object.values(productTaxonomy.entries).filter(entry => entry.reviewStatus === 'reviewed').length} Codex-reviewed taxonomies, ${taxonomyPending.count} pending taxonomy reviews, and ${Object.keys(identityHistory.products).length} stable product identities.`);
