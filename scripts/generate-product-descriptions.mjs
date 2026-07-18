import fs from 'node:fs/promises';

import {
  applyDescriptionCacheToOffers,
  collectPendingDescriptions,
  DEFAULT_DESCRIPTION_MODEL,
  DESCRIPTION_PROMPT_VERSION,
  loadDescriptionCache,
} from './lib/product-descriptions.mjs';
import { responseOutputText, validateGeneratedBatch } from './lib/openai-description-client.mjs';

const cacheUrl = new URL('../data/product_descriptions_zh.json', import.meta.url);
const pendingUrl = new URL('../data/product_descriptions_pending.json', import.meta.url);
const offersUrl = new URL('../data/current_offers.json', import.meta.url);
const args = process.argv.slice(2);
const hasFlag = flag => args.includes(flag);
const valueAfter = flag => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};
const requestedLimit = Number(valueAfter('--limit') || process.env.OPENAI_DESCRIPTION_LIMIT || 100);
const batchSize = Number(valueAfter('--batch-size') || process.env.OPENAI_DESCRIPTION_BATCH_SIZE || 20);
const model = valueAfter('--model') || process.env.OPENAI_DESCRIPTION_MODEL || DEFAULT_DESCRIPTION_MODEL;
const apiKey = process.env.OPENAI_API_KEY || '';
const apiBase = String(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

if (!Number.isInteger(requestedLimit) || requestedLimit < 1) throw new Error('--limit must be a positive integer');
if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 40) throw new Error('--batch-size must be between 1 and 40');

const pending = JSON.parse(await fs.readFile(pendingUrl, 'utf8'));
const cache = await loadDescriptionCache(cacheUrl);
const items = pending.items.filter(item => !cache.entries[item.descriptionKey]).slice(0, requestedLimit);

if (!items.length) {
  console.log('No uncached product descriptions to generate.');
  process.exit(0);
}
if (!apiKey) {
  if (hasFlag('--if-key-present')) {
    console.log(`OPENAI_API_KEY is not configured; leaving ${items.length} queued descriptions for a later run.`);
    process.exit(0);
  }
  throw new Error('OPENAI_API_KEY is required. Add it as a local environment variable or GitHub Actions secret; never put it in the repository.');
}

const developerPrompt = `你是帮助在丹麦生活的中国消费者理解超市商品的编辑。根据商品原文写准确、自然、实用的简体中文说明。

每条说明必须：
1. 先明确这是什么商品；
2. 对陌生食品说明常见吃法、烹调方法或用途；对非食品说明正确用途；
3. 仅在确实有帮助时，说明它与中国常见商品的近似对应和关键区别；
4. 长度通常为 45–110 个中文字符，最多 3 句。

不得猜测原文没有提供的配料、肉类部位、口味、产地、营养、过敏原或认证。商品原文含“eller”（或者）或多个选项时必须说明这是任选促销。信息不足时应明确保留不确定性，并提示按原名或包装确认，不能用空泛的“商品”“食品”代替解释。只返回符合给定 JSON Schema 的结果，并逐条原样返回 descriptionKey。`;

async function generateBatch(batch) {
  const body = {
    model,
    store: false,
    reasoning: { effort: 'low' },
    input: [
      { role: 'developer', content: [{ type: 'input_text', text: developerPrompt }] },
      {
        role: 'user',
        content: [{
          type: 'input_text',
          text: `请为以下 ${batch.length} 个商品生成说明：\n${JSON.stringify(batch.map(item => ({
            descriptionKey: item.descriptionKey,
            originalName: item.originalName,
            originalDescriptions: item.sampleDescriptions,
            categoryId: item.categoryId,
            comparisonGroup: item.comparisonGroup,
          })), null, 2)}`,
        }],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'product_descriptions_zh',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['descriptions'],
          properties: {
            descriptions: {
              type: 'array',
              minItems: batch.length,
              maxItems: batch.length,
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['descriptionKey', 'descriptionZh'],
                properties: {
                  descriptionKey: { type: 'string' },
                  descriptionZh: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    max_output_tokens: 12000,
  };
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${apiBase}/responses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(`OpenAI API ${response.status}: ${payload?.error?.message || 'request failed'}`);
      const outputText = responseOutputText(payload);
      if (!outputText) throw new Error('OpenAI response contained no output text');
      return validateGeneratedBatch(JSON.parse(outputText), batch);
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
}

let generatedCount = 0;
const generatedAt = new Date().toISOString();
for (let offset = 0; offset < items.length; offset += batchSize) {
  const batch = items.slice(offset, offset + batchSize);
  const generated = await generateBatch(batch);
  for (const item of batch) {
    cache.entries[item.descriptionKey] = {
      descriptionZh: generated.get(item.descriptionKey),
      originalName: item.originalName,
      categoryId: item.categoryId,
      comparisonGroup: item.comparisonGroup,
      model,
      promptVersion: DESCRIPTION_PROMPT_VERSION,
      generatedAt,
    };
  }
  generatedCount += batch.length;
  console.log(`Generated ${generatedCount}/${items.length} descriptions with ${model}.`);
}

cache.updatedAt = generatedAt;
cache.defaultModel = model;
cache.entries = Object.fromEntries(Object.entries(cache.entries).sort(([a], [b]) => a.localeCompare(b)));
await fs.writeFile(cacheUrl, JSON.stringify(cache, null, 2) + '\n');

const data = JSON.parse(await fs.readFile(offersUrl, 'utf8'));
const applied = applyDescriptionCacheToOffers(data.offers, cache);
data.offers = applied.offers;
await fs.writeFile(offersUrl, JSON.stringify(data, null, 2) + '\n');

const nextPending = collectPendingDescriptions(data.offers, cache, generatedAt);
await fs.writeFile(pendingUrl, JSON.stringify(nextPending, null, 2) + '\n');
console.log(`Cached ${generatedCount} new descriptions, applied AI text to ${applied.applied} offer rows, ${nextPending.count} unique descriptions remain queued.`);
