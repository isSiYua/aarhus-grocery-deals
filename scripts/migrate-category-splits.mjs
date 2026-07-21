import fs from 'node:fs/promises';

import { ATLANTA_COMPARISON_GROUPS, refineAtlantaCategory, refineAtlantaComparisonGroup } from './lib/flipp-client.mjs';
import { repairPublishedPackage } from './lib/normalize.mjs';
import { AARHUS_CATEGORIES, AARHUS_COMPARISON_GROUPS, normalizedText, refineAarhusCategory, refineAarhusComparisonGroup } from './lib/taxonomy.mjs';

const read = async path => JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
const write = async (path, value) => fs.writeFile(new URL(`../${path}`, import.meta.url), `${JSON.stringify(value, null, 2)}\n`);
const now = new Date().toISOString();
const descriptionKey = (name, comparisonGroup) => `v1|${normalizedText(name)}|${comparisonGroup}`;

function refineAarhusRecord(record, name = record.originalName) {
  // The flyer description is essential for generic names such as "pålæg":
  // "frit valg" reveals that the price covers an assortment rather than one
  // specific sliced meat. Keep the stable key name-only, but classify from all
  // reviewed textual evidence available on the record.
  const classificationText = [name, record.originalDescription].filter(Boolean).join(' ');
  const comparisonGroup = refineAarhusComparisonGroup(record.comparisonGroup, classificationText);
  return {
    ...record,
    categoryId: refineAarhusCategory(record.categoryId, comparisonGroup),
    comparisonGroup,
    ...(record.descriptionKey ? { descriptionKey: descriptionKey(name, comparisonGroup) } : {}),
  };
}

function migrateKnowledgeEntries(entries) {
  const next = {};
  for (const [oldKey, value] of Object.entries(entries)) {
    if (value.status === 'excluded') {
      next[oldKey] = value;
      continue;
    }
    const name = value.originalName || oldKey.split('|')[1];
    const migrated = refineAarhusRecord(value, name);
    const newKey = descriptionKey(name, migrated.comparisonGroup);
    const existing = next[newKey];
    next[newKey] = existing
      ? { ...existing, ...migrated, reviewStatus: existing.reviewStatus === 'reviewed' || migrated.reviewStatus === 'reviewed' ? 'reviewed' : migrated.reviewStatus }
      : migrated;
  }
  return next;
}

function refineAtlantaRecord(record, name = record.originalName) {
  const comparisonGroup = refineAtlantaComparisonGroup(record.comparisonGroup, name);
  return {
    ...record,
    categoryId: refineAtlantaCategory(record.categoryId, comparisonGroup),
    comparisonGroup,
  };
}

const atlantaCategories = [
  ['vegetables', '蔬菜', '🥬', '#3F7147', '新鲜蔬菜、沙拉和预制蔬菜配菜按品种显示。'],
  ['fruit', '水果', '🍎', '#8A4B3D', '新鲜水果和切配水果按品种、包装与重量显示。'],
  ['produce_mixed', '果蔬组合', '🥗', '#5B7650', '无法归入单一品种的果蔬组合和混合加餐。'],
  ['minced_meat', '肉末', '🥟', '#7A4A3A', '牛肉末、鸡肉末和猪肉末集中分组比较。'],
  ['bacon', '培根', '🥓', '#8A5140', '猪肉培根片和火鸡培根片分开显示。'],
  ['sausages', '香肠', '🌭', '#8A5140', '按肉种和香肠类型细分。'],
  ['deli_meat', '冷切与肉片', '🥪', '#8A5140', '冷切肉和肉片按肉种与形态显示。'],
  ['prepared_meat', '肉类制成品', '🍖', '#8A5140', '熟制、裹粉和肉丸等肉制品。'],
  ['fresh_meat', '生鲜肉类', '🥩', '#74423C', '鸡、牛、猪和羊的生鲜部位按商品原名保留。'],
  ['deli_prepared', '熟食、香肠与加工肉', '🥓', '#8A5140', '熟制鸡肉、香肠、培根、冷切和其他加工肉食。'],
  ['seafood', '鱼类海鲜', '🐟', '#236A7A', '鱼类和海鲜优惠；鲜品、冷冻和熟制品分别看待。'],
  ['yoghurt', '酸奶', '🥣', '#9A7A25', '普通酸奶和希腊式酸奶集中展示。'],
  ['cheese', '奶酪', '🧀', '#A26F2D', '切片、刨丝、奶酪棒、餐桌奶酪和奶酪小食按形态分组。'],
  ['dairy', '牛奶、奶油与鸡蛋', '🥛', '#8A7E42', '牛奶、奶油、黄油和鸡蛋等其他乳品。'],
  ['bakery', '面包烘焙', '🍞', '#8A6B32', '面包、贝果、蛋糕和其他烘焙食品优惠。'],
  ['frozen', '冷冻食品', '🧊', '#815187', '冷冻主食、披萨、冰淇淋和其他冷冻食品。'],
  ['potato_products', '土豆制成品', '🍟', '#7A673A', '薯条、薯角、薯饼和土豆泥分别比较。'],
  ['sauces_condiments', '酱料与佐料', '🥫', '#8A5A24', '不同酱料分开显示。'],
  ['cooking_oils', '食用油', '🫒', '#8A6F24', '不同油种分开显示。'],
  ['canned_pickled', '罐头与腌渍食品', '🫙', '#7A602A', '罐头和腌渍食品分开显示。'],
  ['pantry', '主食调味', '🥫', '#8A5A24', '米面、谷物、罐头、酱料和常温食品。'],
  ['snacks', '零食甜品', '🍪', '#955C27', '薯片、饼干、糖果和其他零食甜品。'],
  ['drinks', '饮料', '🥤', '#6B2430', '软饮、果汁、咖啡、茶和其他饮料。'],
  ['alcohol', '啤酒与葡萄酒', '🍷', '#77394C', '啤酒和葡萄酒单独显示；仅供达到当地法定饮酒年龄者。'],
  ['baby', '婴幼儿用品', '🍼', '#9B6485', '婴幼儿食品、纸尿裤和日常用品。'],
  ['household', '家庭日用品', '🧻', '#546875', '纸品、清洁、洗衣和厨房日用品。'],
  ['paper_products', '生活纸品', '🧻', '#546875', '卫生纸、厨房纸、面巾纸和餐巾纸分开。'],
  ['personal', '个人护理', '🧴', '#596A8A', '洗护、口腔护理和个人日用品。'],
  ['pet', '宠物用品', '🐾', '#76614B', '宠物食品、零食和日常用品。'],
].map(([id, nameZh, emoji, color, descriptionZh]) => ({ id, nameZh, emoji, color, descriptionZh }));

const aarhus = await read('data/current_offers.json');
aarhus.categories = AARHUS_CATEGORIES;
aarhus.comparisonGroups = AARHUS_COMPARISON_GROUPS;
aarhus.offers = aarhus.offers.map(offer => repairPublishedPackage(refineAarhusRecord(offer)));
aarhus.metadata.contentUpdatedAt = now;
await write('data/current_offers.json', aarhus);

const taxonomy = await read('data/product_taxonomy_zh.json');
taxonomy.entries = migrateKnowledgeEntries(taxonomy.entries);
for (const offer of aarhus.offers) {
  const source = taxonomy.entries[offer.descriptionKey] || Object.values(taxonomy.entries).find(entry =>
    entry.status !== 'excluded' && normalizedText(entry.originalName) === normalizedText(offer.originalName),
  );
  if (!source) continue;
  taxonomy.entries[offer.descriptionKey] = {
    ...source,
    categoryId: offer.categoryId,
    comparisonGroup: offer.comparisonGroup,
    labelZh: offer.productNameZh,
    originalName: offer.originalName,
  };
}
taxonomy.updatedAt = now;
await write('data/product_taxonomy_zh.json', taxonomy);

const descriptions = await read('data/product_descriptions_zh.json');
descriptions.entries = migrateKnowledgeEntries(descriptions.entries);
for (const offer of aarhus.offers) {
  const source = descriptions.entries[offer.descriptionKey] || Object.values(descriptions.entries).find(entry =>
    normalizedText(entry.originalName) === normalizedText(offer.originalName),
  );
  if (!source) continue;
  descriptions.entries[offer.descriptionKey] = {
    ...source,
    productNameZh: offer.productNameZh,
    descriptionZh: offer.zhExplanation,
    originalName: offer.originalName,
    originalDescription: offer.originalDescription,
    categoryId: offer.categoryId,
    comparisonGroup: offer.comparisonGroup,
  };
}
descriptions.updatedAt = now;
await write('data/product_descriptions_zh.json', descriptions);

const descriptionPending = await read('data/product_descriptions_pending.json');
descriptionPending.items = descriptionPending.items.map(item => refineAarhusRecord(item));
await write('data/product_descriptions_pending.json', descriptionPending);

const taxonomyPending = await read('data/product_taxonomy_pending.json');
taxonomyPending.items = taxonomyPending.items.map(item => {
  const currentComparisonGroup = refineAarhusComparisonGroup(item.currentComparisonGroup, item.originalName);
  return {
    ...item,
    descriptionKey: descriptionKey(item.originalName, currentComparisonGroup),
    currentCategoryId: refineAarhusCategory(item.currentCategoryId, currentComparisonGroup),
    currentComparisonGroup,
  };
});
await write('data/product_taxonomy_pending.json', taxonomyPending);

const identityHistory = await read('data/product_identity_history.json');
const migratedProducts = {};
for (const [oldKey, product] of Object.entries(identityHistory.products)) {
  const name = product.canonicalNames?.[0] || oldKey.split('|')[1];
  const oldPrimaryGroup = oldKey.split('|').at(-1);
  const primaryGroup = refineAarhusComparisonGroup(oldPrimaryGroup, name);
  const groups = [...new Set((product.comparisonGroups || [oldPrimaryGroup]).map(group => refineAarhusComparisonGroup(group, name)))];
  const categories = new Set();
  for (const categoryId of product.categoryIds || []) {
    for (const comparisonGroup of groups) categories.add(refineAarhusCategory(categoryId, comparisonGroup));
  }
  const newKey = descriptionKey(name, primaryGroup);
  const existing = migratedProducts[newKey];
  migratedProducts[newKey] = {
    ...(existing || {}),
    ...product,
    stableProductKey: newKey,
    categoryIds: [...new Set([...(existing?.categoryIds || []), ...categories])],
    comparisonGroups: [...new Set([...(existing?.comparisonGroups || []), ...groups])],
  };
}
// A newly refreshed offer can contain stronger evidence (for example
// "frit valg" in the flyer description) than the stable identity record,
// whose key intentionally contains only the reusable product name. Mirror the
// existing identity evidence to the refined published key so every offer stays
// traceable after a taxonomy migration.
for (const offer of aarhus.offers) {
  const sourceWithOffer = Object.values(migratedProducts).find(product =>
    product.offerIds?.[offer.sourceOfferId || offer.canonicalKey],
  );
  const sameNameIdentity = Object.values(migratedProducts).find(product =>
    product.canonicalNames?.some(name => normalizedText(name) === normalizedText(offer.originalName)),
  );
  const existing = migratedProducts[offer.descriptionKey];
  if (!existing && !sameNameIdentity && !sourceWithOffer) continue;
  const source = sourceWithOffer || sameNameIdentity || existing;
  migratedProducts[offer.descriptionKey] = {
    ...source,
    ...existing,
    stableProductKey: offer.descriptionKey,
    canonicalNames: [...new Set([...(source.canonicalNames || []), ...(existing?.canonicalNames || []), offer.originalName])],
    categoryIds: [...new Set([...(source.categoryIds || []), ...(existing?.categoryIds || []), offer.categoryId])],
    comparisonGroups: [...new Set([...(source.comparisonGroups || []), ...(existing?.comparisonGroups || []), offer.comparisonGroup])],
    stores: [...new Set([...(source.stores || []), ...(existing?.stores || []), offer.storeId])],
    offerIds: { ...(source.offerIds || {}), ...(existing?.offerIds || {}) },
    imageReferences: { ...(source.imageReferences || {}), ...(existing?.imageReferences || {}) },
  };
}
for (const product of Object.values(migratedProducts)) {
  const sources = Object.values(product.offerIds || {});
  product.evidence = {
    ...(product.evidence || {}),
    distinctSourceOfferIdCount: sources.length,
    sameNameSeenWithDifferentSourceIds: sources.length > 1,
    repeatedSourceIdsAcrossPromotionPeriods: sources
      .filter(source => (source.validPeriods || []).length > 1)
      .map(source => source.sourceOfferId),
    exactImageReferencesSharedAcrossSourceIds: Object.entries(product.imageReferences || {})
      .filter(([, image]) => (image.offerIds || []).length > 1)
      .map(([reference, image]) => ({ reference, offerIds: image.offerIds })),
  };
}
identityHistory.products = migratedProducts;
identityHistory.updatedAt = now;
await write('data/product_identity_history.json', identityHistory);

const history = await read('data/history.json');
for (let index = 0; index < history.length; index += 1) history[index] = repairPublishedPackage(refineAarhusRecord(history[index]));
await write('data/history.json', history);

const atlanta = await read('data/atlanta_offers.json');
atlanta.categories = atlantaCategories;
atlanta.comparisonGroups = ATLANTA_COMPARISON_GROUPS;
atlanta.offers = atlanta.offers.map(offer => refineAtlantaRecord(offer));
atlanta.metadata.contentUpdatedAt = now;
await write('data/atlanta_offers.json', atlanta);

const atlantaKnowledge = await read('data/atlanta_product_knowledge_zh.json');
for (const entry of Object.values(atlantaKnowledge.entries)) {
  Object.assign(entry, refineAtlantaRecord(entry));
}
atlantaKnowledge.updatedAt = now;
await write('data/atlanta_product_knowledge_zh.json', atlantaKnowledge);

console.log(`Split ${aarhus.offers.length} Aarhus offers into ${aarhus.categories.length} categories and ${atlanta.offers.length} Atlanta offers into ${atlanta.categories.length} categories.`);
