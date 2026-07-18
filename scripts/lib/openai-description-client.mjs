export function responseOutputText(response) {
  if (typeof response?.output_text === 'string') return response.output_text;
  for (const output of response?.output || []) {
    for (const content of output?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') return content.text;
    }
  }
  return '';
}

export function validateGeneratedBatch(parsed, expectedItems) {
  if (!Array.isArray(parsed?.descriptions)) throw new Error('Model output has no descriptions array');
  const expected = new Set(expectedItems.map(item => item.descriptionKey));
  const generated = new Map();
  for (const item of parsed.descriptions) {
    if (!expected.has(item.descriptionKey)) throw new Error(`Model returned an unexpected descriptionKey: ${item.descriptionKey}`);
    const descriptionZh = String(item.descriptionZh || '').trim();
    if (descriptionZh.length < 20 || descriptionZh.length > 240) throw new Error(`Invalid Chinese description length for ${item.descriptionKey}`);
    if (generated.has(item.descriptionKey)) throw new Error(`Model returned duplicate descriptionKey: ${item.descriptionKey}`);
    generated.set(item.descriptionKey, descriptionZh);
  }
  for (const key of expected) if (!generated.has(key)) throw new Error(`Model omitted descriptionKey: ${key}`);
  return generated;
}
