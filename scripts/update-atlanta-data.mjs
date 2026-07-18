import fs from 'node:fs/promises';
import path from 'node:path';
import { chooseCurrentFlyer, fetchFlyerItems, fetchFlyers, normalizeFlippItems } from './lib/flipp-client.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'data/atlanta_offers.json');
const postalCode = '30318';
const nowIso = new Date().toISOString();
const now = new Date(nowIso);

export const ATLANTA_SOURCES = [
  { storeId: 'kroger-howell-mill', merchant: 'Kroger', flyerNames: ['Weekly Ad'] },
  { storeId: 'publix-howell-mill', merchant: 'Publix', flyerNames: ['Weekly Ad'] },
  { storeId: 'target-midtown', merchant: 'Target', flyerNames: ['Weekly Circular'] },
  { storeId: 'walmart-mlk', merchant: 'Walmart', flyerNames: ['Flyer'] },
];

async function loadPrevious() {
  try {
    return JSON.parse(await fs.readFile(dataPath, 'utf8'));
  } catch {
    return { metadata: {}, offers: [], flyers: [] };
  }
}

const previous = await loadPrevious();
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
    const offers = normalizeFlippItems(rawItems, { storeId: source.storeId, flyer, seenAt: nowIso });
    if (!offers.length) throw new Error('No priced grocery or household items retained');
    freshByStore.set(source.storeId, offers);
    selectedFlyers.push({
      storeId: source.storeId,
      id: flyer.id,
      merchant: flyer.merchant,
      name: flyer.name,
      validFrom: flyer.valid_from,
      validUntil: flyer.valid_to,
      url: `https://flipp.com/flyer/${flyer.id}`,
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
  flyers: selectedFlyers.length ? selectedFlyers : (previous.flyers || []),
  offers: nextOffers.sort((a, b) => a.storeId.localeCompare(b.storeId) || a.categoryId.localeCompare(b.categoryId) || a.price - b.price),
};

await fs.writeFile(dataPath, `${JSON.stringify(next, null, 2)}\n`);
console.log(`Saved ${next.offers.length} Atlanta offers across ${Object.values(storeStatuses).filter(status => status === 'ok').length} live stores.`);
