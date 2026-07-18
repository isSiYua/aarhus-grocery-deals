import fs from 'node:fs/promises';

import {
  isReviewedAarhusOffer,
  isReviewedAtlantaOffer,
  retainReviewedOffers,
} from './lib/fallback-publish.mjs';

const aarhusUrl = new URL('../data/current_offers.json', import.meta.url);
const taxonomyUrl = new URL('../data/product_taxonomy_zh.json', import.meta.url);
const atlantaUrl = new URL('../data/atlanta_offers.json', import.meta.url);
const atlantaKnowledgeUrl = new URL('../data/atlanta_product_knowledge_zh.json', import.meta.url);

const [aarhus, taxonomy, atlanta, atlantaKnowledge] = await Promise.all([
  fs.readFile(aarhusUrl, 'utf8').then(JSON.parse),
  fs.readFile(taxonomyUrl, 'utf8').then(JSON.parse),
  fs.readFile(atlantaUrl, 'utf8').then(JSON.parse),
  fs.readFile(atlantaKnowledgeUrl, 'utf8').then(JSON.parse),
]);

const aarhusResult = retainReviewedOffers(
  aarhus.offers,
  offer => isReviewedAarhusOffer(offer, taxonomy),
);
const atlantaResult = retainReviewedOffers(
  atlanta.offers,
  offer => isReviewedAtlantaOffer(offer, atlantaKnowledge),
);

aarhus.offers = aarhusResult.retained;
aarhus.metadata.fallbackMode = 'reviewed-cache-only';
aarhus.metadata.withheldPendingReview = aarhusResult.withheld.length;
atlanta.offers = atlantaResult.retained;
atlanta.metadata.fallbackMode = 'reviewed-cache-only';
atlanta.metadata.withheldPendingReview = atlantaResult.withheld.length;

await Promise.all([
  fs.writeFile(aarhusUrl, `${JSON.stringify(aarhus, null, 2)}\n`),
  fs.writeFile(atlantaUrl, `${JSON.stringify(atlanta, null, 2)}\n`),
]);

console.log(`Fallback publish retained ${aarhus.offers.length} Aarhus offers and withheld ${aarhusResult.withheld.length} pending review.`);
console.log(`Fallback publish retained ${atlanta.offers.length} Atlanta offers and withheld ${atlantaResult.withheld.length} pending review.`);
