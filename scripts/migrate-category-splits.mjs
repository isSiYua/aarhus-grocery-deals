import fs from 'node:fs/promises';

import { ATLANTA_COMPARISON_GROUPS, refineAtlantaCategory, refineAtlantaComparisonGroup } from './lib/flipp-client.mjs';
import { repairPublishedPackage } from './lib/normalize.mjs';
import { AARHUS_CATEGORIES, AARHUS_COMPARISON_GROUPS, normalizedText, refineAarhusCategory, refineAarhusComparisonGroup } from './lib/taxonomy.mjs';

const read = async path => JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
const write = async (path, value) => fs.writeFile(new URL(`../${path}`, import.meta.url), `${JSON.stringify(value, null, 2)}\n`);
const now = new Date().toISOString();
const descriptionKey = (name, comparisonGroup) => `v1|${normalizedText(name)}|${comparisonGroup}`;

function refineAarhusRecord(record, name = record.originalName) {
  const comparisonGroup = refineAarhusComparisonGroup(record.comparisonGroup, name);
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
    if (next[newKey]) throw new Error(`Duplicate migrated product knowledge key: ${newKey}`);
    next[newKey] = migrated;
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
  ['fresh_meat', '生鲜肉类', '🥩', '#74423C', '鸡、牛、猪和羊的生鲜部位按商品原名保留。'],
  ['deli_prepared', '熟食、香肠与加工肉', '🥓', '#8A5140', '熟制鸡肉、香肠、培根、冷切和其他加工肉食。'],
  ['seafood', '鱼类海鲜', '🐟', '#236A7A', '鱼类和海鲜优惠；鲜品、冷冻和熟制品分别看待。'],
  ['yoghurt', '酸奶', '🥣', '#9A7A25', '普通酸奶和希腊式酸奶集中展示。'],
  ['cheese', '奶酪', '🧀', '#A26F2D', '切片、刨丝、奶酪棒、餐桌奶酪和奶酪小食按形态分组。'],
  ['dairy', '牛奶、奶油与鸡蛋', '🥛', '#8A7E42', '牛奶、奶油、黄油和鸡蛋等其他乳品。'],
  ['bakery', '面包烘焙', '🍞', '#8A6B32', '面包、贝果、蛋糕和其他烘焙食品优惠。'],
  ['frozen', '冷冻食品', '🧊', '#815187', '冷冻主食、披萨、冰淇淋和其他冷冻食品。'],
  ['pantry', '主食调味', '🥫', '#8A5A24', '米面、谷物、罐头、酱料和常温食品。'],
  ['snacks', '零食甜品', '🍪', '#955C27', '薯片、饼干、糖果和其他零食甜品。'],
  ['drinks', '饮料', '🥤', '#6B2430', '软饮、果汁、咖啡、茶和其他饮料。'],
  ['alcohol', '啤酒与葡萄酒', '🍷', '#77394C', '啤酒和葡萄酒单独显示；仅供达到当地法定饮酒年龄者。'],
  ['baby', '婴幼儿用品', '🍼', '#9B6485', '婴幼儿食品、纸尿裤和日常用品。'],
  ['household', '家庭日用品', '🧻', '#546875', '纸品、清洁、洗衣和厨房日用品。'],
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
taxonomy.updatedAt = now;
await write('data/product_taxonomy_zh.json', taxonomy);

const descriptions = await read('data/product_descriptions_zh.json');
descriptions.entries = migrateKnowledgeEntries(descriptions.entries);
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
  if (migratedProducts[newKey]) throw new Error(`Duplicate migrated product identity: ${newKey}`);
  migratedProducts[newKey] = {
    ...product,
    stableProductKey: newKey,
    categoryIds: [...categories],
    comparisonGroups: groups,
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
