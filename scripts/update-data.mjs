import fs from 'node:fs/promises';
import path from 'node:path';
import { listDanishDealers, fetchDealerOffers, fetchDealerStores } from './lib/tjek-client.mjs';
import { normalizeOffer } from './lib/normalize.mjs';
import { mergeIncrementally } from './lib/merge.mjs';
import { AARHUS_CATEGORIES, AARHUS_COMPARISON_GROUPS } from './lib/taxonomy.mjs';
import { collectPendingDescriptions, loadDescriptionCache } from './lib/product-descriptions.mjs';
import { collectPendingTaxonomy, loadProductTaxonomy } from './lib/product-taxonomy.mjs';
import { isAarhusRelevantOffer, publicStoreRecord } from './lib/aarhus-coverage.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'data/current_offers.json');
const historyPath = path.join(root, 'data/history.json');
const descriptionCachePath = path.join(root, 'data/product_descriptions_zh.json');
const descriptionPendingPath = path.join(root, 'data/product_descriptions_pending.json');
const taxonomyPath = path.join(root, 'data/product_taxonomy_zh.json');
const taxonomyPendingPath = path.join(root, 'data/product_taxonomy_pending.json');
const reviewOverridesPath = path.join(root, 'data/product_review_overrides_zh.json');
const nowIso = new Date().toISOString();
const wantedStores = {
  netto: ['netto'],
  lidl: ['lidl'],
  rema: ['rema 1000', 'rema1000'],
  '365': ['365discount', 'coop 365'],
  foetex: ['føtex', 'foetex'],
  bilka: ['bilka'],
  kvickly: ['kvickly'],
  meny: ['meny'],
  loevbjerg: ['løvbjerg', 'lovbjerg'],
  superbrugsen: ['superbrugsen', 'super brugsen'],
  spar: ['spar'],
  min_koebmand: ['min købmand', 'min kobmand'],
  brugsen: ['brugsen'],
  letkoeb: ['let-køb', 'let køb', 'let-kob'],
  salling: ['salling'],
  wolt_market: ['wolt market'],
};

const aarhusStores = [
  {
    id: 'lidl',
    name: 'Lidl',
    color: '#0050AA',
    shortAddress: 'Aarhus 全市多家门店',
    distanceLabel: '连锁促销覆盖；具体库存按门店',
    membership: '部分价格需 Lidl Plus',
    descriptionZh: '本页使用 Lidl 的公开连锁促销，覆盖 Aarhus 市内各 Lidl 分店；商品是否有货和门店专属活动仍以所选分店为准。',
    website: 'https://www.lidl.dk/',
    flyerUrl: 'https://www.lidl.dk/c/tilbudsavis/s10013730',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Lidl+Aarhus',
  },
  {
    id: 'netto',
    name: 'Netto',
    color: '#6B5700',
    shortAddress: 'Aarhus 全市多家门店',
    distanceLabel: '连锁促销覆盖；具体库存按门店',
    membership: '部分价格需 Netto+',
    descriptionZh: '本页使用 Netto 的公开连锁促销，覆盖 Aarhus 市内各 Netto 分店；不会把同一促销为每个地址重复一次。',
    website: 'https://netto.dk/',
    flyerUrl: 'https://etilbudsavis.dk/Netto',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Netto+Aarhus',
  },
  {
    id: 'rema',
    name: 'REMA 1000',
    color: '#15499A',
    shortAddress: 'Aarhus 全市多家门店',
    distanceLabel: '连锁促销覆盖；具体库存按门店',
    membership: '通常不强制会员',
    descriptionZh: '本页使用 REMA 1000 的公开连锁促销，覆盖 Aarhus 市内各分店；基础食品和自有品牌较多。',
    website: 'https://rema1000.dk/',
    flyerUrl: 'https://etilbudsavis.dk/REMA-1000',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=REMA+1000+Aarhus',
  },
  {
    id: '365',
    name: '365discount',
    color: '#5B2C83',
    shortAddress: 'Aarhus 全市多家门店',
    distanceLabel: '连锁促销覆盖；具体库存按门店',
    membership: '部分价格需 Coop App',
    descriptionZh: '本页使用 365discount 的公开连锁促销，覆盖 Aarhus 市内各分店；会员价和普通价会按来源条件显示。',
    website: 'https://365discount.coop.dk/',
    flyerUrl: 'https://etilbudsavis.dk/365discount',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=365discount+Aarhus',
  },
  {
    id: 'foetex',
    name: 'føtex',
    color: '#D71920',
    shortAddress: 'Aarhus 全市多家门店',
    distanceLabel: '连锁促销覆盖；具体库存按门店',
    membership: '部分价格需 føtex Plus',
    descriptionZh: '本页使用 føtex 的公开连锁促销，覆盖 Aarhus 市内各 føtex 与 føtex food 分店；综合品类较全。',
    website: 'https://www.foetex.dk/',
    flyerUrl: 'https://etilbudsavis.dk/fotex',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=f%C3%B8tex+Aarhus',
  },
  {
    id: 'bilka',
    name: 'Bilka Tilst',
    color: '#1B4B9B',
    shortAddress: 'Agerøvej 7, 8381 Tilst',
    distanceLabel: '大型卖场，适合一次大量采购',
    membership: '部分价格需 Bilka Plus',
    descriptionZh: 'Aarhus 区域的大型 Bilka 卖场，大包装和多件促销较多；商品是否有货仍以 Tilst 门店为准。',
    website: 'https://www.bilka.dk/',
    flyerUrl: 'https://etilbudsavis.dk/Bilka',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Bilka+Tilst+Ager%C3%B8vej+7',
  },
  {
    id: 'kvickly',
    name: 'Kvickly Åbyhøj',
    color: '#E84A27',
    shortAddress: 'Silkeborgvej 573, 8230 Åbyhøj',
    distanceLabel: 'Aarhus 区域综合超市',
    membership: '部分价格需 Coop App',
    descriptionZh: 'eTilbudsavis 提供可核验的 Kvickly 周促销，因此商品会与其他商店一起参与本期和下期比较。',
    website: 'https://kvickly.coop.dk/find-butik/kvickly-aabyhoej/2010/',
    flyerUrl: 'https://etilbudsavis.dk/Kvickly',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Kvickly+Silkeborgvej+573+Aabyhoej',
  },
  {
    id: 'meny',
    name: 'MENY',
    color: '#243B2F',
    shortAddress: 'Aarhus C、Risskov、Viby 等门店',
    distanceLabel: '连锁促销覆盖；本地选品可能不同',
    membership: '部分价格需 MENY App',
    descriptionZh: 'MENY 在 Aarhus 有多家门店，本页加入其公开周促销。熟食、生鲜和门店自选商品可能因分店不同而变化。',
    website: 'https://meny.dk/find-butik/',
    flyerUrl: 'https://etilbudsavis.dk/Meny',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=MENY+Aarhus',
  },
  {
    id: 'loevbjerg',
    name: 'Løvbjerg Trøjborg',
    color: '#D71920',
    shortAddress: 'Otte Ruds Gade 98, 8200 Aarhus N',
    distanceLabel: 'Trøjborg 综合超市',
    membership: '部分活动可能有门店条件',
    descriptionZh: 'Aarhus 的 Løvbjerg 位于 Trøjborg。本页加入公开促销；长期价或单店短期活动会按来源有效期显示。',
    website: 'https://www.lovbjerg.dk/butik/loevbjerg-troejborg-aarhus',
    flyerUrl: 'https://etilbudsavis.dk/Lovbjerg',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=L%C3%B8vbjerg+Otte+Ruds+Gade+98+Aarhus',
  },
  {
    id: 'superbrugsen',
    name: 'SuperBrugsen',
    color: '#E4002B',
    shortAddress: 'Aarhus 全市多家门店',
    distanceLabel: '连锁促销覆盖；具体库存按门店',
    membership: '部分价格需 Coop App',
    descriptionZh: '本页使用 SuperBrugsen 的公开连锁促销，覆盖 Aarhus 市区及周边分店；单店自选活动可能不同。',
    website: 'https://superbrugsen.coop.dk/find-butik/',
    flyerUrl: 'https://etilbudsavis.dk/SuperBrugsen',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=SuperBrugsen+Aarhus',
  },
  {
    id: 'spar',
    name: 'SPAR',
    color: '#087A3E',
    shortAddress: 'Aarhus / Skejby 等门店',
    distanceLabel: '社区超市；选品按门店',
    membership: '公开周促销',
    descriptionZh: '本页加入 SPAR 的公开周促销，服务 Aarhus 的社区型分店；小店库存和参加活动情况可能不同。',
    website: 'https://spar.dk/find-butik',
    flyerUrl: 'https://etilbudsavis.dk/SPAR',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=SPAR+Aarhus',
  },
  {
    id: 'min_koebmand',
    name: 'Min Købmand',
    color: '#C8192D',
    shortAddress: 'Aarhus 区域社区门店',
    distanceLabel: '社区超市；选品按门店',
    membership: '公开周促销',
    descriptionZh: '本页加入 Min Købmand 的公开周促销。社区门店规模不同，购买前应从地图确认最近门店及库存。',
    website: 'https://minkobmand.dk/find-butik',
    flyerUrl: 'https://etilbudsavis.dk/Min-Kobmand',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Min+K%C3%B8bmand+Aarhus',
  },
  {
    id: 'brugsen',
    name: 'Brugsen',
    color: '#E4002B',
    shortAddress: 'Hjortshøj、Sabro、Skødstrup 等门店',
    distanceLabel: 'Aarhus Kommune 社区门店',
    membership: '部分价格需 Coop App',
    descriptionZh: '本页加入 Brugsen 的公开促销，覆盖 Aarhus Kommune 内多家社区门店；各店参加情况和库存可能不同。',
    website: 'https://brugsen.coop.dk/find-butik/',
    flyerUrl: 'https://etilbudsavis.dk/Brugsen',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Brugsen+Aarhus+Kommune',
  },
  {
    id: 'letkoeb',
    name: 'LET-KØB',
    color: '#D71920',
    shortAddress: 'Sønderborggade 9, 8000 Aarhus C 等门店',
    distanceLabel: '社区便利超市',
    membership: '公开促销单；门店参加情况可能不同',
    descriptionZh: '本页加入 LET-KØB 的公开促销。社区小店并非每一项都一定有货，页面不会把促销单当成实时库存。',
    website: 'https://letkoeb.dk/',
    flyerUrl: 'https://etilbudsavis.dk/Let-Kob',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=LET-K%C3%98B+Aarhus',
  },
  {
    id: 'salling',
    name: 'Salling Super Aarhus',
    color: '#111111',
    shortAddress: 'Søndergade 27, 8000 Aarhus C',
    distanceLabel: 'Salling 地下层精品超市',
    membership: '当前公开 feed 无可解析促销商品',
    descriptionZh: 'Salling Aarhus 地下层确有 Salling Super，包含生鲜、鱼肉、熟食、果蔬和食品杂货。更新器会每天检查其公开促销来源；当前 feed 为 0 条，因此只保留入口，不伪造价格。',
    website: 'https://salling.dk/stormagasiner/aarhus/',
    flyerUrl: 'https://etilbudsavis.dk/Salling',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Salling+S%C3%B8ndergade+27+Aarhus',
  },
  {
    id: 'wolt_market',
    name: 'Wolt Market',
    color: '#009DE0',
    shortAddress: 'Aarhus 区域在线食品超市',
    distanceLabel: '配送范围与库存按 Wolt 所选地址',
    membership: '公开促销；配送费与最低订单额另计',
    descriptionZh: 'Wolt Market 是在线食品超市。本页只比较其公开商品促销价；能否配送、实时库存、服务费和最终结算价以 Wolt 为准。',
    website: 'https://wolt.com/',
    flyerUrl: 'https://etilbudsavis.dk/Wolt-Market',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Wolt+Market+Aarhus',
  },
  {
    id: 'kft',
    name: 'KFT Jylland',
    color: '#6F8C32',
    shortAddress: 'Viborgvej 155A, 8210 Aarhus V',
    distanceLabel: '亚洲食品与新鲜亚洲蔬菜专门店',
    membership: '官网价格需登录，暂无公开周促销 feed',
    descriptionZh: 'KFT 确有 Aarhus V 门店，但不在 eTilbudsavis 商家目录中；官网商品价格需登录，旧促销 PDF 当前已失效。因此只保留对中国用户有用的商店入口，不伪造价格或参与最低价。',
    website: 'https://kft.dk/',
    flyerUrl: 'https://kft.dk/product-category/dagligvarer/',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=KFT+Jylland+Viborgvej+155A+Aarhus',
  },
];

const normalizeName = value => String(value || '').toLowerCase().replace(/ø/g,'o').replace(/æ/g,'ae');
async function loadJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
}

const previous = await loadJson(dataPath, { metadata:{}, stores:[], categories:[], comparisonGroups:{}, offers:[] });
const descriptionCache = await loadDescriptionCache(descriptionCachePath);
const productTaxonomy = await loadProductTaxonomy(taxonomyPath);
const reviewOverrides = await loadJson(reviewOverridesPath, { entries: {} });
const previousHistory = await loadJson(historyPath, []);
const previousDescriptionPending = await loadJson(descriptionPendingPath, null);
const previousTaxonomyPending = await loadJson(taxonomyPendingPath, null);
previous.history = previousHistory;
let dealers = [];
let directoryError = null;
try {
  dealers = await listDanishDealers();
} catch (error) {
  directoryError = error;
  console.error('Dealer directory:', error);
}
const dealerFor = aliases => dealers.find(d => aliases.some(a => normalizeName(d.name).includes(normalizeName(a))));
const freshByStore = {};
const storeStatuses = {};
const nearbyStoresByStore = {};
const sourceNamesByStore = {};

for (const [storeId, aliases] of Object.entries(wantedStores)) {
  if (directoryError) {
    storeStatuses[storeId] = 'failed';
    continue;
  }
  const dealer = dealerFor(aliases);
  if (!dealer) {
    storeStatuses[storeId] = 'failed';
    console.warn(`No dealer match for ${storeId}`);
    continue;
  }
  try {
    const [raw, rawStores] = await Promise.all([
      fetchDealerOffers(dealer.id),
      fetchDealerStores(dealer.id),
    ]);
    const nearbyStores = rawStores.map(item => publicStoreRecord(item, dealer.name)).filter(Boolean);
    const localStoreIds = new Set(nearbyStores.map(store => store.id));
    const normalized = raw
      .filter(item => isAarhusRelevantOffer(item, storeId, localStoreIds))
      .map(item => normalizeOffer(item, nowIso, { descriptionCache, productTaxonomy, reviewOverrides }))
      .filter(item => item && item.storeId === storeId);
    freshByStore[storeId] = normalized;
    nearbyStoresByStore[storeId] = nearbyStores;
    sourceNamesByStore[storeId] = dealer.name;
    storeStatuses[storeId] = 'ok';
    console.log(`${storeId}: ${normalized.length} retained offers; ${nearbyStores.length} Aarhus stores`);
  } catch (error) {
    storeStatuses[storeId] = 'failed';
    console.error(`${storeId}:`, error);
  }
}

const result = mergeIncrementally(previous, freshByStore, storeStatuses, nowIso);
const failedStores = Object.entries(storeStatuses).filter(([,s]) => s === 'failed').map(([id]) => id);
const anySuccessfulStore = Object.values(storeStatuses).some(status => status === 'ok');
const previousForOutput = { ...previous };
delete previousForOutput.history;
const sortedOffers = [...result.offers].sort((a, b) => (
  String(a.storeId).localeCompare(String(b.storeId))
  || String(a.categoryId).localeCompare(String(b.categoryId))
  || String(a.comparisonGroup).localeCompare(String(b.comparisonGroup))
  || String(a.originalName).localeCompare(String(b.originalName), 'da')
  || String(a.canonicalKey).localeCompare(String(b.canonicalKey))
));
const next = {
  ...previousForOutput,
  stores: aarhusStores.map(store => ({
    ...store,
    sourceName: sourceNamesByStore[store.id] || store.sourceName || store.name,
    nearbyStores: nearbyStoresByStore[store.id] || previous.stores?.find(item => item.id === store.id)?.nearbyStores || [],
  })),
  categories: AARHUS_CATEGORIES,
  comparisonGroups: AARHUS_COMPARISON_GROUPS,
  metadata: {
    ...previous.metadata,
    mode: anySuccessfulStore ? 'live' : (previous.metadata.mode || 'demo'),
    stale: failedStores.length > 0,
    failedStores,
    source: 'Tjek / eTilbudsavis public offer feed',
    coverageScope: 'Major Aarhus city and Aarhus Kommune grocery chains; structured comparison only for verifiable public flyer feeds',
    chainLevelOffers: true,
  },
  offers: sortedOffers,
};

const stableOffer = offer => {
  const { lastSeenAt, ...rest } = offer;
  return {
    ...rest,
    sourceLocation: rest.sourceLocation ? { ...rest.sourceLocation, verifiedAt: null } : rest.sourceLocation,
  };
};
const publishState = value => ({
  stores: value.stores,
  categories: value.categories,
  comparisonGroups: value.comparisonGroups,
  mode: value.metadata?.mode || null,
  stale: Boolean(value.metadata?.stale),
  failedStores: value.metadata?.failedStores || [],
  offers: [...(value.offers || [])].map(stableOffer).sort((a, b) => String(a.canonicalKey).localeCompare(String(b.canonicalKey))),
});
const publishedChanged = JSON.stringify(publishState(previous)) !== JSON.stringify(publishState(next));
next.metadata.updatedAt = publishedChanged ? nowIso : (previous.metadata.updatedAt || nowIso);
next.metadata.contentUpdatedAt = previous.metadata.contentUpdatedAt || next.metadata.updatedAt;
await fs.writeFile(dataPath, JSON.stringify(next, null, 2) + '\n');
await fs.writeFile(historyPath, JSON.stringify(result.history, null, 2) + '\n');
const generatedPendingDescriptions = collectPendingDescriptions(next.offers, descriptionCache, nowIso);
const pendingDescriptions = previousDescriptionPending
  && JSON.stringify(previousDescriptionPending.items) === JSON.stringify(generatedPendingDescriptions.items)
  ? previousDescriptionPending
  : generatedPendingDescriptions;
await fs.writeFile(descriptionPendingPath, JSON.stringify(pendingDescriptions, null, 2) + '\n');
const generatedPendingTaxonomy = collectPendingTaxonomy(next.offers, productTaxonomy, nowIso);
const pendingTaxonomy = previousTaxonomyPending
  && JSON.stringify(previousTaxonomyPending.items) === JSON.stringify(generatedPendingTaxonomy.items)
  ? previousTaxonomyPending
  : generatedPendingTaxonomy;
await fs.writeFile(taxonomyPendingPath, JSON.stringify(pendingTaxonomy, null, 2) + '\n');
console.log(`Saved ${next.offers.length} current offers; ${result.history.length} archived records; ${pendingDescriptions.count} descriptions and ${pendingTaxonomy.count} taxonomy entries pending Codex review.`);
