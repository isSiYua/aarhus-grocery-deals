import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'data/current_offers.json');
const locatorPath = path.join(root, 'data/source_locators.json');
const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
const file = JSON.parse(await fs.readFile(locatorPath, 'utf8'));
const byKey = new Map((file.locators || []).map(item => [item.canonicalKey, item]));
let applied = 0;
for (const offer of data.offers) {
  const loc = byKey.get(offer.canonicalKey);
  if (!loc) continue;
  if (!['verified','direct'].includes(loc.status)) throw new Error(`Invalid locator status for ${offer.canonicalKey}`);
  if (loc.status === 'verified' && (!Number.isInteger(loc.pageNumber) || loc.pageNumber < 1)) {
    throw new Error(`Verified locator requires 1-based pageNumber: ${offer.canonicalKey}`);
  }
  offer.sourceLocation = {
    status: loc.status,
    pageNumber: loc.pageNumber ?? null,
    positionLabel: loc.positionLabel ?? null,
    deepLink: loc.deepLink ?? null,
    verifiedAt: loc.verifiedAt ?? new Date().toISOString(),
    method: loc.method ?? 'manual_review',
  };
  offer.sourcePage = loc.pageNumber ?? null;
  applied++;
}
await fs.writeFile(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`Applied ${applied} verified/direct source locators.`);
