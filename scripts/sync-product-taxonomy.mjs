import fs from 'node:fs/promises';

import { applyProductTaxonomyToOffers, collectPendingTaxonomy, loadProductTaxonomy } from './lib/product-taxonomy.mjs';
import { AARHUS_CATEGORIES, AARHUS_COMPARISON_GROUPS } from './lib/taxonomy.mjs';

const offersUrl = new URL('../data/current_offers.json', import.meta.url);
const taxonomyUrl = new URL('../data/product_taxonomy_zh.json', import.meta.url);
const pendingUrl = new URL('../data/product_taxonomy_pending.json', import.meta.url);
const data = JSON.parse(await fs.readFile(offersUrl, 'utf8'));
const taxonomy = await loadProductTaxonomy(taxonomyUrl);
const applied = applyProductTaxonomyToOffers(data.offers, taxonomy);
data.offers = applied.offers;
data.categories = AARHUS_CATEGORIES;
data.comparisonGroups = AARHUS_COMPARISON_GROUPS;
await fs.writeFile(offersUrl, JSON.stringify(data, null, 2) + '\n');
const pending = collectPendingTaxonomy(data.offers, taxonomy);
await fs.writeFile(pendingUrl, JSON.stringify(pending, null, 2) + '\n');
console.log(`Applied fixed taxonomy to ${applied.changed} offer rows, excluded ${applied.excluded} out-of-scope rows, and queued ${pending.count} stable products for Codex taxonomy review.`);
