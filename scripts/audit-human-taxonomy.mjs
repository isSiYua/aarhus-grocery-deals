import fs from 'node:fs/promises';

import { AARHUS_COMPARISON_GROUPS, refineAarhusCategory, normalizedText } from './lib/taxonomy.mjs';

const read = async path => JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
const aarhus = await read('data/current_offers.json');
const atlanta = await read('data/atlanta_offers.json');
const overrides = (await read('data/product_review_overrides_zh.json')).entries;
const errors = [];
const warnings = [];
const fail = (offer, message) => errors.push(`${message}: ${offer.originalName}`);

const expectedLeadingCategories = ['vegetables', 'fruit', 'chicken', 'minced_meat', 'pork_fresh', 'beef', 'seafood'];
const actualLeadingCategories = aarhus.categories.slice(0, expectedLeadingCategories.length).map(category => category.id);
if (actualLeadingCategories.join('|') !== expectedLeadingCategories.join('|')) {
  errors.push(`基础品类顺序不正确：${actualLeadingCategories.join(', ')}`);
}

for (const offer of aarhus.offers) {
  const name = normalizedText(`${offer.originalName} ${offer.originalDescription || ''}`);
  const group = AARHUS_COMPARISON_GROUPS[offer.comparisonGroup];
  if (!group) fail(offer, `不存在的 Aarhus 比价小类 ${offer.comparisonGroup}`);
  if (offer.categoryId !== refineAarhusCategory(offer.categoryId, offer.comparisonGroup)) {
    fail(offer, `大类与小类不一致 ${offer.categoryId}/${offer.comparisonGroup}`);
  }
  if (!String(offer.productNameZh || '').trim() || !String(offer.zhExplanation || '').trim()) {
    fail(offer, '缺少中文名称或解释');
  }
  if (String(offer.zhExplanation || '').trim().length < 12) fail(offer, '中文解释过短');

  if (/(hotwings|buffalo wings|sol mar kyllingevinger)/.test(name)
      && (offer.categoryId !== 'prepared_meat' || offer.comparisonGroup !== 'prepared_chicken_wings_seasoned')) {
    fail(offer, '调味鸡翅误归入生鲜鸡肉');
  }
  if (/morliny classic eller crispy hot wings/.test(name)
      && (offer.categoryId !== 'prepared_meat' || offer.comparisonGroup !== 'prepared_chicken_wings_mixed_offer')) {
    fail(offer, '普通/裹粉鸡翅任选未隔离比价');
  }
  if (/marineret kyllingebryst/.test(name)
      && (offer.categoryId !== 'prepared_meat' || offer.comparisonGroup !== 'prepared_chicken_breast_marinated')) {
    fail(offer, '腌制鸡胸误归入原味生鸡胸');
  }
  if (/burgerboffer af oksekod|hamburger af oksekod/.test(name)
      && (offer.categoryId !== 'prepared_meat' || offer.comparisonGroup !== 'prepared_beef_burgers')) {
    fail(offer, '成型牛肉汉堡饼误归入生鲜牛肉');
  }
  if (/fiskefars/.test(name) && offer.comparisonGroup !== 'fish_mince') fail(offer, '鱼肉糜误归入整片鱼类');
  if (/salatbowls|hvidkaalssalat/.test(name) && offer.comparisonGroup !== 'prepared_salad') fail(offer, '预制沙拉分类错误');
  if (/melonmix|frugtmix|ananas i skiver/.test(name) && offer.comparisonGroup !== 'prepared_fruit') fail(offer, '切配水果分类错误');
  if (/ribena/.test(name)) fail(offer, '浓缩果汁饮料误作新鲜水果发布');
  if (/vaadservietter|wet wipes/.test(name) && offer.comparisonGroup !== 'paper_wet_wipes') fail(offer, '湿巾与干纸品混类');
  if (/lommeletter|ansigtsservietter|facial tissue/.test(name) && offer.comparisonGroup !== 'paper_facial') fail(offer, '手帕纸或面巾纸分类错误');
  if (/tomatketchup/.test(name) && !/番茄酱/.test(offer.productNameZh)) fail(offer, '番茄酱中文名称不清楚');
  if (offer.comparisonGroup.includes('mixed_offer') && group?.comparable !== false) {
    fail(offer, '跨形态任选促销仍参与统一最低价');
  }
  if (offer.categoryId === 'chicken' && /调味|腌制|脆皮|裹粉|已熟|冷冻鸡翅/.test(offer.zhExplanation || '')) {
    fail(offer, '解释显示为制成品但仍归入生鲜鸡肉');
  }
  if (['chicken', 'pork_fresh', 'beef'].includes(offer.categoryId)
      && /marineret|marinerede|pulled pork|buffalo|crispy|breaded|paneret|chimichurri|smokey bbq|peberkant|roget kamben|kotelet.*tilsat lage/.test(name)) {
    fail(offer, '明确腌制、熟制或裹粉肉类仍归入生鲜大类');
  }
}

for (const [key, override] of Object.entries(overrides)) {
  const matches = aarhus.offers.filter(offer => normalizedText(offer.originalName) === key);
  if (override.status === 'excluded') {
    if (matches.length) errors.push(`已排除商品仍出现在页面：${key}`);
    continue;
  }
  for (const offer of matches) {
    if (offer.categoryId !== override.categoryId || offer.comparisonGroup !== override.comparisonGroup) {
      fail(offer, '仓库固定复核规则没有应用');
    }
    if (offer.productNameZh !== override.productNameZh || offer.zhExplanation !== override.descriptionZh) {
      fail(offer, '仓库固定中文解释没有应用');
    }
  }
}

for (const offer of atlanta.offers) {
  const name = normalizedText(`${offer.originalName} ${offer.originalDescription || ''}`);
  if (!String(offer.productNameZh || '').trim() || !String(offer.zhExplanation || '').trim()) {
    fail(offer, 'Atlanta 缺少中文名称或解释');
  }
  if (/(breaded|fried|buffalo|nugget|popcorn chicken|chicken sandwich|chicken wrap)/.test(name)
      && ['fresh_meat', 'chicken'].includes(offer.categoryId)) {
    fail(offer, 'Atlanta 熟制或裹粉鸡肉误归入生鲜肉类');
  }
}

const genericDescriptions = aarhus.offers.filter(offer => /请按原名|具体品种以原名|原名为准/.test(offer.zhExplanation || ''));
if (genericDescriptions.length) {
  warnings.push(`${genericDescriptions.length} 项原始促销名称本身较宽泛，保留了按包装确认的提示`);
}

if (errors.length) {
  console.error(`Human taxonomy audit failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Human taxonomy audit passed: ${aarhus.offers.length} Aarhus offers, ${atlanta.offers.length} Atlanta offers.`);
for (const warning of warnings) console.log(`Review note: ${warning}.`);
