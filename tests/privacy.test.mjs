import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('published data contains no private home-base fields, secrets, or home wording', async () => {
  const [data, atlanta, atlantaKnowledge, descriptionCache, descriptionPending, productTaxonomy, taxonomyPending] = await Promise.all([
    fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8').then(JSON.parse),
    fs.readFile(new URL('../data/atlanta_offers.json', import.meta.url), 'utf8').then(JSON.parse),
    fs.readFile(new URL('../data/atlanta_product_knowledge_zh.json', import.meta.url), 'utf8').then(JSON.parse),
    fs.readFile(new URL('../data/product_descriptions_zh.json', import.meta.url), 'utf8').then(JSON.parse),
    fs.readFile(new URL('../data/product_descriptions_pending.json', import.meta.url), 'utf8').then(JSON.parse),
    fs.readFile(new URL('../data/product_taxonomy_zh.json', import.meta.url), 'utf8').then(JSON.parse),
    fs.readFile(new URL('../data/product_taxonomy_pending.json', import.meta.url), 'utf8').then(JSON.parse),
  ]);

  assert.equal(Object.hasOwn(data.metadata, 'addressLabel'), false);
  assert.equal(Object.hasOwn(atlanta.metadata, 'addressLabel'), false);
  assert.doesNotMatch(JSON.stringify(atlanta), /homeBase|privateAddress|residentAddress/i);
  assert.doesNotMatch(JSON.stringify({ atlantaKnowledge, descriptionCache, descriptionPending, productTaxonomy, taxonomyPending }), /sk-[A-Za-z0-9_-]{20,}|OPENAI_API_KEY|api[_-]?key/i);
  for (const store of data.stores) {
    assert.doesNotMatch(store.descriptionZh, /住址|住宅|家庭地址/);
    assert.doesNotMatch(store.mapUrl, /\bnear\b/i);
  }
});
