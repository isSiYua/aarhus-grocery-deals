import fs from 'node:fs/promises';

import { refineAtlantaCategory } from './lib/flipp-client.mjs';
import { AARHUS_CATEGORIES, refineAarhusCategory } from './lib/taxonomy.mjs';

const read = async path => JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
const write = async (path, value) => fs.writeFile(new URL(`../${path}`, import.meta.url), `${JSON.stringify(value, null, 2)}\n`);
const now = new Date().toISOString();

const atlantaCategories = [
  ['vegetables', '蔬菜', '🥬', '#3F7147', '新鲜蔬菜、沙拉和预制蔬菜配菜按品种显示。'],
  ['fruit', '水果', '🍎', '#8A4B3D', '新鲜水果和切配水果按品种、包装与重量显示。'],
  ['produce_mixed', '果蔬组合', '🥗', '#5B7650', '无法归入单一品种的果蔬组合和混合加餐。'],
  ['fresh_meat', '生鲜肉类', '🥩', '#74423C', '鸡、牛、猪和羊的生鲜部位按商品原名保留。'],
  ['deli_prepared', '熟食、香肠与加工肉', '🥓', '#8A5140', '熟制鸡肉、香肠、培根、冷切和其他加工肉食。'],
  ['seafood', '鱼类海鲜', '🐟', '#236A7A', '鱼类和海鲜优惠；鲜品、冷冻和熟制品分别看待。'],
  ['dairy', '乳制品鸡蛋', '🥛', '#9A7A25', '牛奶、奶酪、酸奶和鸡蛋优惠。'],
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
aarhus.offers = aarhus.offers.map(offer => ({
  ...offer,
  categoryId: refineAarhusCategory(offer.categoryId, offer.comparisonGroup),
}));
aarhus.metadata.contentUpdatedAt = now;
await write('data/current_offers.json', aarhus);

const taxonomy = await read('data/product_taxonomy_zh.json');
for (const entry of Object.values(taxonomy.entries)) {
  if (entry.status !== 'excluded') entry.categoryId = refineAarhusCategory(entry.categoryId, entry.comparisonGroup);
}
taxonomy.updatedAt = now;
await write('data/product_taxonomy_zh.json', taxonomy);

const descriptions = await read('data/product_descriptions_zh.json');
for (const entry of Object.values(descriptions.entries)) {
  entry.categoryId = refineAarhusCategory(entry.categoryId, entry.comparisonGroup);
}
descriptions.updatedAt = now;
await write('data/product_descriptions_zh.json', descriptions);

const descriptionPending = await read('data/product_descriptions_pending.json');
descriptionPending.items = descriptionPending.items.map(item => ({
  ...item,
  categoryId: refineAarhusCategory(item.categoryId, item.comparisonGroup),
}));
await write('data/product_descriptions_pending.json', descriptionPending);

const taxonomyPending = await read('data/product_taxonomy_pending.json');
taxonomyPending.items = taxonomyPending.items.map(item => ({
  ...item,
  currentCategoryId: refineAarhusCategory(item.currentCategoryId, item.currentComparisonGroup),
}));
await write('data/product_taxonomy_pending.json', taxonomyPending);

const identityHistory = await read('data/product_identity_history.json');
for (const product of Object.values(identityHistory.products)) {
  const refined = new Set();
  for (const categoryId of product.categoryIds || []) {
    for (const comparisonGroup of product.comparisonGroups || []) refined.add(refineAarhusCategory(categoryId, comparisonGroup));
  }
  product.categoryIds = [...refined];
}
identityHistory.updatedAt = now;
await write('data/product_identity_history.json', identityHistory);

const history = await read('data/history.json');
for (const offer of history) offer.categoryId = refineAarhusCategory(offer.categoryId, offer.comparisonGroup);
await write('data/history.json', history);

const atlanta = await read('data/atlanta_offers.json');
atlanta.categories = atlantaCategories;
atlanta.offers = atlanta.offers.map(offer => ({
  ...offer,
  categoryId: refineAtlantaCategory(offer.categoryId, offer.comparisonGroup),
}));
atlanta.metadata.contentUpdatedAt = now;
await write('data/atlanta_offers.json', atlanta);

const atlantaKnowledge = await read('data/atlanta_product_knowledge_zh.json');
for (const entry of Object.values(atlantaKnowledge.entries)) {
  entry.categoryId = refineAtlantaCategory(entry.categoryId, entry.comparisonGroup);
}
atlantaKnowledge.updatedAt = now;
await write('data/atlanta_product_knowledge_zh.json', atlantaKnowledge);

console.log(`Split ${aarhus.offers.length} Aarhus offers into ${aarhus.categories.length} categories and ${atlanta.offers.length} Atlanta offers into ${atlanta.categories.length} categories.`);
