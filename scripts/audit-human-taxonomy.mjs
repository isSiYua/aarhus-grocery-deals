import fs from 'node:fs/promises';

import { AARHUS_COMPARISON_GROUPS, refineAarhusCategory, normalizedText } from './lib/taxonomy.mjs';
import { ITEM_DESCRIPTION_META_PATTERN } from './lib/description-quality.mjs';

const read = async path => JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
const aarhus = await read('data/current_offers.json');
const atlanta = await read('data/atlanta_offers.json');
const overrides = (await read('data/product_review_overrides_zh.json')).entries;
const errors = [];
const warnings = [];
const fail = (offer, message) => errors.push(`${message}: ${offer.originalName}`);
const legacyGenericZh = /商品（请核对原名）|其他家居用品|其他电子电器|其他休闲、户外或兴趣用品|成人服饰或鞋袜|儿童服饰或鞋袜|请按原名|请按原始商品名|购买前请确认|购买时请确认年龄段|具体功能以商品原名|具体用途由商品原名|具体品种以原名|原名为准|因商品而异|需按原名/;
const dangerousDescriptionTemplate = /预制方便餐。方便餐或预制菜|这是汽水，可直接饮用的碳酸软饮|这是烈酒或利口酒，酒精度较高的蒸馏酒或甜味酒|这是电脑或网络设备，用于学习、办公、存储或网络连接。有多个款式或型号可选/;
const evasiveProductCopy = /公开文字没有|不能负责任|应先从原名和图片确认|有多个款式或型号可选|肉种或具体形态不明确|购买时按原名/;

const expectedLeadingCategories = ['vegetables', 'fruit', 'chicken', 'minced_meat', 'pork_fresh', 'beef', 'seafood'];
const actualLeadingCategories = aarhus.categories.slice(0, expectedLeadingCategories.length).map(category => category.id);
if (actualLeadingCategories.join('|') !== expectedLeadingCategories.join('|')) {
  errors.push(`基础品类顺序不正确：${actualLeadingCategories.join(', ')}`);
}

const expectedTrailingCategories = [
  'soft_drinks', 'juice_drinks', 'other_drinks',
  'alcohol_beer', 'alcohol_wine_red', 'alcohol_wine_white', 'alcohol_wine_rose_sparkling', 'alcohol_wine_mixed', 'alcohol_wine_other', 'alcohol_spirits', 'alcohol_rtd',
  'pet', 'flowers_plants',
  'home_appliances', 'kitchenware', 'home_storage', 'home_furniture', 'home_textiles_decor', 'home_tools_garden',
  'electronics_tv_audio', 'electronics_mobile', 'electronics_computing', 'electronics_other',
  'clothing_adult', 'clothing_underwear_socks', 'clothing_footwear_accessories', 'clothing_children', 'clothing_mixed',
  'leisure_toys_play', 'leisure_stationery_learning', 'leisure_cycling', 'leisure_sports_outdoors', 'leisure_other',
  'tobacco_nicotine', 'other_offers',
];
const actualTrailingCategories = aarhus.categories.slice(-expectedTrailingCategories.length).map(category => category.id);
if (actualTrailingCategories.join('|') !== expectedTrailingCategories.join('|')) {
  errors.push(`低频品类顺序不正确：${actualTrailingCategories.join(', ')}`);
}

for (const offer of aarhus.offers) {
  const heading = normalizedText(offer.originalName);
  const name = normalizedText(`${offer.originalName} ${offer.originalDescription || ''}`);
  const group = AARHUS_COMPARISON_GROUPS[offer.comparisonGroup];
  if (!group) fail(offer, `不存在的 Aarhus 比价小类 ${offer.comparisonGroup}`);
  if (offer.categoryId !== refineAarhusCategory(offer.categoryId, offer.comparisonGroup)) {
    fail(offer, `大类与小类不一致 ${offer.categoryId}/${offer.comparisonGroup}`);
  }
  if (!String(offer.productNameZh || '').trim() || !String(offer.zhExplanation || '').trim()) {
    fail(offer, '缺少中文名称或解释');
  }
  if (!/[\u3400-\u9fff]/u.test(offer.productNameZh || '')) fail(offer, '中文主标题没有中文商品名');
  const compactOriginal = String(offer.originalName || '').replace(/\*+$/u, '').trim();
  if (compactOriginal && String(offer.productNameZh || '').startsWith(`${compactOriginal}（`)) {
    fail(offer, '中文主标题错误地重复原名并使用括号翻译');
  }
  if (String(offer.zhExplanation || '').trim().length < 12) fail(offer, '中文解释过短');
  if (ITEM_DESCRIPTION_META_PATTERN.test(offer.zhExplanation || '')) fail(offer, '商品说明混入了比价系统规则');
  if (legacyGenericZh.test(`${offer.productNameZh || ''} ${offer.zhExplanation || ''}`)) fail(offer, '仍在使用空泛的旧版中文模板');
  if (dangerousDescriptionTemplate.test(offer.zhExplanation || '')) fail(offer, '仍在使用会掩盖商品身份的通用描述模板');
  if (evasiveProductCopy.test(offer.zhExplanation || '')) fail(offer, '商品说明仍把识别工作推给用户');
  if (/silvercrest elkedel.*smoothie maker/.test(name)
      && (offer.comparisonGroup !== 'home_appliances' || !/电热水壶.*搅拌机/.test(`${offer.productNameZh} ${offer.zhExplanation}`))) {
    fail(offer, '厨房电器被 smoothie 关键词误判为饮料');
  }
  if (/depend neglefil.*kiss naturlige vipper/.test(name)
      && (offer.comparisonGroup !== 'personal_makeup' || !/美甲锉.*假睫毛/.test(`${offer.productNameZh} ${offer.zhExplanation}`))) {
    fail(offer, '美甲锉或假睫毛商品身份错误');
  }
  if (/proteinbar|proteinkugler|protein snack|energi gel/.test(name)
      && (offer.comparisonGroup !== 'supplement_sports_snack' || !/蛋白|能量胶/.test(offer.productNameZh || ''))) {
    fail(offer, '蛋白零食或运动能量补给误归入普通糖果、薯片或麦片');
  }
  if (/^surdejspizza .*prosciutto.*diavola/.test(name)
      && (offer.comparisonGroup !== 'pizza_snacks' || !/披萨/.test(offer.productNameZh || ''))) {
    fail(offer, '成品披萨误归入普通面包');
  }
  if (/^nye lammefjords kartofler/.test(name)
      && (offer.comparisonGroup !== 'potatoes_fresh' || !/土豆/.test(offer.productNameZh || ''))) {
    fail(offer, 'Lammefjords 产地词误触发羊肉分类');
  }
  if (/^realme c\d+/.test(name)
      && (offer.comparisonGroup !== 'electronics_mobile' || !/智能手机/.test(offer.productNameZh || ''))) {
    fail(offer, 'Realme 智能手机误归入其他电子产品');
  }
  if (/computertaske|stylus(?: pen)?/.test(name)
      && (offer.comparisonGroup !== 'electronics_computer_accessory' || !/电脑包|触控笔/.test(`${offer.productNameZh} ${offer.zhExplanation}`))) {
    fail(offer, '电脑包或触控笔商品身份错误');
  }
  if (/\bskaerm\b/.test(heading)
      && offer.comparisonGroup.startsWith('electronics_')
      && (offer.comparisonGroup !== 'electronics_monitor' || !/显示器/.test(offer.productNameZh || ''))) {
    fail(offer, '显示器被误认为电脑或其他电子产品');
  }
  if (/gamerstol/.test(name)
      && (offer.comparisonGroup !== 'home_furniture' || !/电竞椅|游戏椅/.test(`${offer.productNameZh} ${offer.zhExplanation}`))) {
    fail(offer, '电竞椅被误认为电源或电子产品');
  }
  if (/baileys.*(?:\bis\b|triple chocolate)/.test(name)
      && !/eller grant/.test(name)
      && (offer.comparisonGroup !== 'ice_cream' || !/冰淇淋/.test(offer.productNameZh || ''))) {
    fail(offer, 'Baileys 风味冰淇淋误归入酒类');
  }
  if (/coca cola|pepsi|fanta|faxe kondi|tuborg squash|sprite|7 up/.test(name)
      && offer.comparisonGroup.startsWith('drink_')
      && !/可乐|橙|果味|柠檬|青柠|汤力|能量/.test(`${offer.productNameZh} ${offer.zhExplanation}`)) {
    fail(offer, '品牌汽水没有说明实际饮料类型或风味');
  }
  if (/whey|kreatin|creatin|pwo/.test(name)
      && offer.comparisonGroup === 'supplements'
      && !/蛋白|肌酸|训练|咖啡因/.test(offer.zhExplanation || '')) {
    fail(offer, '运动补剂没有说明主要成分和用途');
  }
  if (/gazpacho|taquitos|paella|bao|pho|pollo alla|polpette con/.test(name)
      && offer.comparisonGroup === 'ready_meal'
      && /通常加热即可|预制方便餐/.test(offer.zhExplanation || '')) {
    fail(offer, '明确菜式仍被通用方便餐模板覆盖');
  }
  if (/avocadoolie|avocado oil/.test(name)
      && (offer.categoryId !== 'cooking_oils' || offer.comparisonGroup !== 'oil_other' || !/牛油果油/.test(offer.productNameZh || ''))) {
    fail(offer, '牛油果油被误归为新鲜牛油果');
  }
  if (/tortilla chips/.test(heading)
      && (offer.categoryId !== 'salty_snacks' || offer.comparisonGroup !== 'chips' || !/玉米片/.test(`${offer.productNameZh} ${offer.zhExplanation}`))) {
    fail(offer, 'Tortilla chips 被误归为面粉或饼皮');
  }
  if (/\bpowerbank\b/.test(heading)) {
    const advertisedCapacity = heading.match(/(\d[\d.]*)\s*mah/);
    if (advertisedCapacity && !new RegExp(`${advertisedCapacity[1]}\\s*mAh`, 'i').test(offer.zhExplanation || '')) {
      fail(offer, '移动电源解释没有使用主商品名称中的标称容量');
    }
  }
  if (offer.categoryId.startsWith('leisure_') && /(?:^| )(?:is|iskasse|magnum|solero|gelatelli)(?: |$)/.test(name)) {
    fail(offer, '冰淇淋或冰品误归入休闲用品');
  }
  if (offer.categoryId.startsWith('personal_') && /意大利面|葡萄酒|编织毛线|成人服饰|儿童服饰/.test(offer.productNameZh || '')) {
    fail(offer, '个人护理商品使用了其他品类的中文名称');
  }
  if (offer.comparisonGroup.startsWith('alcohol_wine') && /毛线|针织|钩编/.test(`${offer.productNameZh || ''} ${offer.zhExplanation || ''}`)) {
    fail(offer, '葡萄酒品牌片段误触发了手工用品解释');
  }
  if (offer.comparisonGroup.startsWith('clothing_adult')
      && /str\.?\s*(?:80|86|92|98|104|110|116|122|128|134|140|146|152|158|164|170)(?:\/\d{2,3})?\s*[-–]\s*(?:86|92|98|104|110|116|122|128|134|140|146|152|158|164|170)/i.test(offer.originalDescription || '')) {
    fail(offer, '儿童身高尺码误归入成人服饰');
  }

  if (/(hotwings|buffalo wings|sol mar kyllingevinger)/.test(name)
      && (offer.categoryId !== 'prepared_poultry' || offer.comparisonGroup !== 'prepared_chicken_wings_seasoned')) {
    fail(offer, '调味鸡翅误归入生鲜鸡肉');
  }
  if (/morliny classic eller crispy hot wings/.test(name)
      && (offer.categoryId !== 'prepared_poultry' || offer.comparisonGroup !== 'prepared_chicken_wings_mixed_offer')) {
    fail(offer, '普通/裹粉鸡翅任选未隔离比价');
  }
  if (/marineret kyllingebryst/.test(name)
      && (offer.categoryId !== 'prepared_poultry' || offer.comparisonGroup !== 'prepared_chicken_breast_marinated')) {
    fail(offer, '腌制鸡胸误归入原味生鸡胸');
  }
  if (/burgerboffer af oksekod|hamburger af oksekod/.test(name)
      && (offer.categoryId !== 'prepared_beef_lamb' || offer.comparisonGroup !== 'prepared_beef_burgers')) {
    fail(offer, '成型牛肉汉堡饼误归入生鲜牛肉');
  }
  if (/fiskefars/.test(name) && offer.comparisonGroup !== 'fish_mince') fail(offer, '鱼肉糜误归入整片鱼类');
  if (/salatbowls|hvidkaalssalat/.test(name) && offer.comparisonGroup !== 'prepared_salad') fail(offer, '预制沙拉分类错误');
  if (/melonmix|frugtmix|ananas i skiver/.test(name) && offer.comparisonGroup !== 'prepared_fruit') fail(offer, '切配水果分类错误');
  if (/ribena/.test(name) && (offer.categoryId !== 'juice_drinks' || offer.comparisonGroup !== 'drink_concentrate')) {
    fail(offer, 'Ribena 浓缩果汁饮料分类错误');
  }
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

const otherOffers = aarhus.offers.filter(offer => offer.categoryId === 'other_offers');
if (otherOffers.length > 20) errors.push(`“其他促销”仍堆积过多：${otherOffers.length} 条`);

const categoryCounts = new Map();
for (const offer of aarhus.offers) categoryCounts.set(offer.categoryId, (categoryCounts.get(offer.categoryId) || 0) + 1);
for (const [categoryId, count] of categoryCounts) {
  if (count > 220) errors.push(`大类仍过度拥挤：${categoryId} 有 ${count} 条促销`);
}

for (const [key, override] of Object.entries(overrides)) {
  const matches = aarhus.offers.filter(offer => normalizedText(offer.originalName) === key || offer.descriptionKey === key);
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
  if (ITEM_DESCRIPTION_META_PATTERN.test(offer.zhExplanation || '')) fail(offer, 'Atlanta 商品说明混入了比价系统规则');
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
