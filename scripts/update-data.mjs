import fs from 'node:fs/promises';
import path from 'node:path';
import { listDanishDealers, fetchDealerOffers } from './lib/tjek-client.mjs';
import { normalizeOffer } from './lib/normalize.mjs';
import { mergeIncrementally } from './lib/merge.mjs';
import { AARHUS_CATEGORIES, AARHUS_COMPARISON_GROUPS } from './lib/taxonomy.mjs';
import { collectPendingDescriptions, loadDescriptionCache } from './lib/product-descriptions.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'data/current_offers.json');
const historyPath = path.join(root, 'data/history.json');
const descriptionCachePath = path.join(root, 'data/product_descriptions_zh.json');
const descriptionPendingPath = path.join(root, 'data/product_descriptions_pending.json');
const nowIso = new Date().toISOString();
const wantedStores = {
  netto: ['netto'],
  lidl: ['lidl'],
  rema: ['rema 1000', 'rema1000'],
  '365': ['365discount', 'coop 365'],
  foetex: ['føtex', 'foetex'],
  bilka: ['bilka'],
  kvickly: ['kvickly'],
};

const additionalStores = [
  {
    id: 'kvickly',
    name: 'Kvickly Åbyhøj',
    color: '#E84A27',
    shortAddress: 'Silkeborgvej 573, 8230 Åbyhøj',
    distanceLabel: 'Aarhus V 周边的综合超市',
    membership: '部分价格需 Coop App',
    descriptionZh: 'eTilbudsavis 提供可核验的 Kvickly 周促销，因此商品会与其他商店一起参与本期和下期比较。',
    website: 'https://kvickly.coop.dk/find-butik/kvickly-aabyhoej/2010/',
    flyerUrl: 'https://etilbudsavis.dk/Kvickly',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Kvickly+Silkeborgvej+573+Aabyhoej',
  },
  {
    id: 'kft',
    name: 'KFT Jylland',
    color: '#6F8C32',
    shortAddress: 'Viborgvej 155A, 8210 Aarhus V',
    distanceLabel: '亚洲食品与新鲜亚洲蔬菜专门店',
    membership: '官网价格需登录，暂无公开周促销 feed',
    descriptionZh: 'KFT 确有 Aarhus V 门店，但不在 eTilbudsavis 商家目录中；官网商品价格需登录，旧促销 PDF 当前已失效。因此只保留商店入口，不伪造价格或参与最低价。',
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
const previousHistory = await loadJson(historyPath, []);
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
    const raw = await fetchDealerOffers(dealer.id);
    const normalized = raw.map(item => normalizeOffer(item, nowIso, { descriptionCache })).filter(item => item && item.storeId === storeId);
    freshByStore[storeId] = normalized;
    storeStatuses[storeId] = 'ok';
    console.log(`${storeId}: ${normalized.length} retained offers`);
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
const next = {
  ...previousForOutput,
  stores: [
    ...previous.stores.filter(store => !additionalStores.some(additional => additional.id === store.id)),
    ...additionalStores,
  ],
  categories: AARHUS_CATEGORIES,
  comparisonGroups: AARHUS_COMPARISON_GROUPS,
  metadata: {
    ...previous.metadata,
    mode: anySuccessfulStore ? 'live' : (previous.metadata.mode || 'demo'),
    updatedAt: nowIso,
    stale: failedStores.length > 0,
    failedStores,
    source: 'Tjek / eTilbudsavis public offer feed',
  },
  offers: result.offers,
};
await fs.writeFile(dataPath, JSON.stringify(next, null, 2) + '\n');
await fs.writeFile(historyPath, JSON.stringify(result.history, null, 2) + '\n');
const pendingDescriptions = collectPendingDescriptions(next.offers, descriptionCache, nowIso);
await fs.writeFile(descriptionPendingPath, JSON.stringify(pendingDescriptions, null, 2) + '\n');
console.log(`Saved ${next.offers.length} current offers; ${result.history.length} archived records; ${pendingDescriptions.count} product descriptions pending AI generation.`);
