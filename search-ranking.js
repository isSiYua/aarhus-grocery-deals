function normalized(value) {
  return String(value || '').trim().toLocaleLowerCase('zh-CN');
}

function fieldScore(value, query, weights) {
  const text = normalized(value);
  if (!text || !query) return 0;
  if (text === query) return weights.exact;
  if (text.startsWith(query)) return weights.startsWith;
  if (text.includes(query)) return weights.includes;
  return 0;
}

/**
 * Rank identity matches ahead of incidental words in descriptions.
 * A search for “鸡蛋” should therefore show actual eggs before bacon whose
 * serving suggestion merely says that it can be eaten with eggs.
 */
export function offerSearchScore(offer, rawQuery, context = {}) {
  const query = normalized(rawQuery);
  if (!query) return 0;

  const identityScore = Math.max(
    fieldScore(offer?.productNameZh, query, { exact: 1200, startsWith: 1050, includes: 900 }),
    fieldScore(offer?.originalName, query, { exact: 1150, startsWith: 1000, includes: 850 }),
    fieldScore(context.comparisonGroupName, query, { exact: 1000, startsWith: 850, includes: 700 }),
  );
  if (identityScore) return identityScore;

  const storeScore = fieldScore(context.storeName, query, { exact: 650, startsWith: 560, includes: 480 });
  if (storeScore) return storeScore;

  return Math.max(
    fieldScore(offer?.originalDescription, query, { exact: 320, startsWith: 260, includes: 180 }),
    fieldScore(offer?.zhExplanation, query, { exact: 300, startsWith: 240, includes: 120 }),
  );
}
