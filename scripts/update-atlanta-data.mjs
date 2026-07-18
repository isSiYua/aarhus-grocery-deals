import fs from 'node:fs/promises';
import path from 'node:path';
import { ATLANTA_COMPARISON_GROUPS, buildFlippFlyerUrl, chooseCurrentFlyer, fetchFlyerItems, fetchFlyers, normalizeFlippItems } from './lib/flipp-client.mjs';
import { loadAtlantaProductKnowledge } from './lib/flipp-product-knowledge.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'data/atlanta_offers.json');
const knowledgePath = path.join(root, 'data/atlanta_product_knowledge_zh.json');
const postalCode = '30318';
const locationSlug = 'atlanta-ga';
const nowIso = new Date().toISOString();
const now = new Date(nowIso);

export const ATLANTA_SOURCES = [
  { storeId: 'kroger-howell-mill', merchant: 'Kroger', flyerNames: ['Weekly Ad'] },
  { storeId: 'publix-howell-mill', merchant: 'Publix', flyerNames: ['Weekly Ad'] },
  { storeId: 'target-midtown', merchant: 'Target', flyerNames: ['Weekly Circular'] },
  { storeId: 'walmart-mlk', merchant: 'Walmart', flyerNames: ['Flyer'] },
];

const ATLANTA_CATEGORIES = [
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


async function loadPrevious() {
  try {
    return JSON.parse(await fs.readFile(dataPath, 'utf8'));
  } catch {
    return { metadata: {}, offers: [], flyers: [] };
  }
}

const previous = await loadPrevious();
const productKnowledge = await loadAtlantaProductKnowledge(knowledgePath);
const freshByStore = new Map();
const selectedFlyers = [];
const storeStatuses = {};

let flyers = [];
let directoryError = null;
try {
  flyers = await fetchFlyers(postalCode);
} catch (error) {
  directoryError = error;
  console.error('Atlanta flyer directory:', error);
}

for (const source of ATLANTA_SOURCES) {
  if (directoryError) {
    storeStatuses[source.storeId] = 'failed';
    continue;
  }
  const flyer = chooseCurrentFlyer(flyers, source, now);
  if (!flyer) {
    storeStatuses[source.storeId] = 'failed';
    console.warn(`No current Atlanta flyer for ${source.storeId}`);
    continue;
  }
  try {
    const rawItems = await fetchFlyerItems(flyer.id, postalCode);
    const offers = normalizeFlippItems(rawItems, { storeId: source.storeId, flyer, seenAt: nowIso, postalCode, locationSlug, productKnowledge });
    if (!offers.length) throw new Error('No priced grocery or household items retained');
    freshByStore.set(source.storeId, offers);
    selectedFlyers.push({
      storeId: source.storeId,
      id: flyer.id,
      merchant: flyer.merchant,
      name: flyer.name,
      validFrom: flyer.valid_from,
      validUntil: flyer.valid_to,
      url: buildFlippFlyerUrl(flyer.id, { postalCode, locationSlug }),
    });
    storeStatuses[source.storeId] = 'ok';
    console.log(`${source.storeId}: ${offers.length} Atlanta offers`);
  } catch (error) {
    storeStatuses[source.storeId] = 'failed';
    console.error(`${source.storeId}:`, error);
  }
}

const nextOffers = [];
for (const source of ATLANTA_SOURCES) {
  if (storeStatuses[source.storeId] === 'ok') {
    nextOffers.push(...freshByStore.get(source.storeId));
  } else {
    nextOffers.push(...previous.offers
      .filter(offer => offer.storeId === source.storeId)
      .map(offer => ({ ...offer, status: 'unconfirmed' })));
  }
}

const failedStores = Object.entries(storeStatuses).filter(([, status]) => status === 'failed').map(([storeId]) => storeId);
const anySuccessfulStore = Object.values(storeStatuses).some(status => status === 'ok');
const next = {
  metadata: {
    mode: anySuccessfulStore ? 'live' : (previous.metadata.mode || 'empty'),
    updatedAt: nowIso,
    stale: failedStores.length > 0,
    failedStores,
    postalCode,
    source: 'Flipp public weekly-ad feed',
    sourceUrl: 'https://flipp.com/',
    disclaimerZh: '周促销按 30318 区域匹配；具体门店库存和会员条件以零售商为准。',
  },
  categories: ATLANTA_CATEGORIES,
  comparisonGroups: ATLANTA_COMPARISON_GROUPS,
  flyers: selectedFlyers.length ? selectedFlyers : (previous.flyers || []),
  offers: nextOffers.sort((a, b) => a.storeId.localeCompare(b.storeId) || a.categoryId.localeCompare(b.categoryId) || a.price - b.price),
};

await fs.writeFile(dataPath, `${JSON.stringify(next, null, 2)}\n`);
console.log(`Saved ${next.offers.length} Atlanta offers across ${Object.values(storeStatuses).filter(status => status === 'ok').length} live stores.`);
