import fs from 'node:fs/promises';
import path from 'node:path';
import { listDanishDealers, fetchDealerOffers } from './lib/tjek-client.mjs';
import { normalizeOffer } from './lib/normalize.mjs';
import { mergeIncrementally } from './lib/merge.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'data/current_offers.json');
const historyPath = path.join(root, 'data/history.json');
const nowIso = new Date().toISOString();
const wantedStores = {
  netto: ['netto'],
  lidl: ['lidl'],
  rema: ['rema 1000', 'rema1000'],
  '365': ['365discount', 'coop 365'],
  foetex: ['føtex', 'foetex'],
  bilka: ['bilka'],
};

const normalizeName = value => String(value || '').toLowerCase().replace(/ø/g,'o').replace(/æ/g,'ae');

async function loadJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
}

const previous = await loadJson(dataPath, { metadata:{}, stores:[], categories:[], comparisonGroups:{}, offers:[] });
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
    const normalized = raw.map(item => normalizeOffer(item, nowIso)).filter(item => item && item.storeId === storeId);
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
const next = {
  ...previous,
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
console.log(`Saved ${next.offers.length} current offers; ${result.history.length} archived records.`);
