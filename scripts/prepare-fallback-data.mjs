import fs from 'node:fs/promises';

import {
  isReviewedAarhusOffer,
  retainReviewedOffers,
} from './lib/fallback-publish.mjs';

const aarhusUrl = new URL('../data/current_offers.json', import.meta.url);
const taxonomyUrl = new URL('../data/product_taxonomy_zh.json', import.meta.url);
const [aarhus, taxonomy] = await Promise.all([
  fs.readFile(aarhusUrl, 'utf8').then(JSON.parse),
  fs.readFile(taxonomyUrl, 'utf8').then(JSON.parse),
]);

const aarhusResult = retainReviewedOffers(
  aarhus.offers,
  offer => isReviewedAarhusOffer(offer, taxonomy),
);
aarhus.offers = aarhusResult.retained;
aarhus.metadata.fallbackMode = 'reviewed-cache-only';
aarhus.metadata.withheldPendingReview = aarhusResult.withheld.length;
await fs.writeFile(aarhusUrl, `${JSON.stringify(aarhus, null, 2)}\n`);

console.log(`Fallback publish retained ${aarhus.offers.length} Aarhus offers and withheld ${aarhusResult.withheld.length} pending review.`);
