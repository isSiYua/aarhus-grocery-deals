import fs from 'node:fs/promises';

import { applyDescriptionCacheToOffers, collectPendingDescriptions, loadDescriptionCache } from './lib/product-descriptions.mjs';

const dataUrl = new URL('../data/current_offers.json', import.meta.url);
const cacheUrl = new URL('../data/product_descriptions_zh.json', import.meta.url);
const pendingUrl = new URL('../data/product_descriptions_pending.json', import.meta.url);
const data = JSON.parse(await fs.readFile(dataUrl, 'utf8'));
const cache = await loadDescriptionCache(cacheUrl);
const applied = applyDescriptionCacheToOffers(data.offers, cache);
data.offers = applied.offers;
await fs.writeFile(dataUrl, JSON.stringify(data, null, 2) + '\n');
const pending = collectPendingDescriptions(data.offers, cache);
await fs.writeFile(pendingUrl, JSON.stringify(pending, null, 2) + '\n');
console.log(`Queued ${pending.count} unique product descriptions; ${data.offers.length - pending.count} current offer rows are duplicates or cached.`);
