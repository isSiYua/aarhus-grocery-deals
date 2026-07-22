import fs from 'node:fs/promises';

import { DESCRIPTION_SPEC_VERSION } from './lib/product-descriptions.mjs';
import { ITEM_DESCRIPTION_META_PATTERN, sanitizeItemDescriptionZh } from './lib/description-quality.mjs';

const targets = [
  { url: new URL('../data/product_descriptions_zh.json', import.meta.url), kind: 'cache' },
  { url: new URL('../data/product_review_overrides_zh.json', import.meta.url), kind: 'cache' },
  { url: new URL('../data/current_offers.json', import.meta.url), kind: 'offers' },
  { url: new URL('../data/history.json', import.meta.url), kind: 'history' },
];

const updatedAt = new Date().toISOString();

for (const target of targets) {
  const data = JSON.parse(await fs.readFile(target.url, 'utf8'));
  let changed = 0;

  if (target.kind === 'cache') {
    for (const entry of Object.values(data.entries || {})) {
      const cleaned = sanitizeItemDescriptionZh(entry.descriptionZh);
      if (cleaned !== entry.descriptionZh) {
        entry.descriptionZh = cleaned;
        entry.descriptionSpecVersion = DESCRIPTION_SPEC_VERSION;
        changed += 1;
      }
      if (ITEM_DESCRIPTION_META_PATTERN.test(entry.descriptionZh || '')) {
        throw new Error(`Unresolved item-description meta language in ${target.url.pathname}: ${entry.descriptionZh}`);
      }
    }
    if (data.descriptionSpecVersion) data.descriptionSpecVersion = DESCRIPTION_SPEC_VERSION;
    if (changed) data.updatedAt = updatedAt;
  } else {
    const offers = target.kind === 'history' ? data : (data.offers || []);
    for (const offer of offers) {
      const cleaned = sanitizeItemDescriptionZh(offer.zhExplanation);
      if (cleaned !== offer.zhExplanation) {
        offer.zhExplanation = cleaned;
        if (offer.descriptionVersion) offer.descriptionVersion = DESCRIPTION_SPEC_VERSION;
        changed += 1;
      }
      if (ITEM_DESCRIPTION_META_PATTERN.test(offer.zhExplanation || '')) {
        throw new Error(`Unresolved published item-description meta language in ${target.url.pathname}: ${offer.zhExplanation}`);
      }
    }
    if (changed && data.metadata) data.metadata.contentUpdatedAt = updatedAt;
  }

  if (changed) await fs.writeFile(target.url, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${target.url.pathname.split('/').at(-1)}: cleaned ${changed} descriptions`);
}
