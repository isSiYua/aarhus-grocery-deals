import fs from 'node:fs/promises';

const read = file => fs.readFile(new URL(file, import.meta.url), 'utf8').then(JSON.parse);
const [data, descriptions, taxonomy] = await Promise.all([
  read('../data/current_offers.json'),
  read('../data/product_descriptions_pending.json'),
  read('../data/product_taxonomy_pending.json'),
]);

const pending = Math.max(descriptions.count || 0, taxonomy.count || 0);
const summary = [
  '## Aarhus grocery refresh',
  '',
  `- Current published offers: ${data.offers.length}`,
  `- Active grocery chains with offers: ${new Set(data.offers.map(offer => offer.storeId)).size}`,
  `- Pending Chinese descriptions: ${descriptions.count || 0}`,
  `- Pending taxonomy reviews: ${taxonomy.count || 0}`,
  '- Scheduled refresh uses repository rules and reviewed product knowledge; no model API or token is used.',
  '',
].join('\n');

if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
console.log(summary);
if (pending > 0) {
  console.log(`::warning title=New grocery products need review::${pending} new or ambiguous Aarhus products were withheld from Pages and added to the review queue.`);
}
