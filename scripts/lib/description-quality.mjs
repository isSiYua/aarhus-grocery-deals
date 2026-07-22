// Product copy should explain the item itself. Price-comparison rules belong to
// comparisonGroup metadata and the price UI, never in the shopper-facing copy.
export const ITEM_DESCRIPTION_META_PATTERN = /最低(?:单)?价|混比|比价(?:组)?|单独比较|按(?:每包)?片数比较|不属于[^。；]{0,30}促销|(?:不与|不能(?:当作|作为|与)?|不要与|只与|不计算|不参与|不按|无法)[^。；]{0,100}比较/;

const USEFUL_REWRITES = [
  [
    /若是带荚鲜豌豆，需要先剥出豆粒，不能与去壳豌豆按同一可食重量比较/g,
    '若是带荚鲜豌豆，需要先剥出豆粒，可食豆粒会少于标示重量',
  ],
  [
    /需要先剥出豆粒，不能与去壳豌豆按同一可食重量比较/g,
    '需要先剥出豆粒，可食豆粒会少于标示重量',
  ],
  [
    /标价按带荚重量计算时，可食豆粒会少于标示重量，不能与去壳豌豆按同一重量直接比价/g,
    '标价按带荚重量计算时，可食豆粒会少于标示重量',
  ],
  [/它按片数比较，不与卫生纸、厨房纸或餐巾纸混比/g, '每包片数和适用用途请以包装为准'],
  [/按每包片数比较，不与干纸巾混比/g, '每包片数和适用用途请以包装为准'],
  [/大小和包装不同仍属于同一种土豆比价组/g, '常见包装规格可能不同'],
];

const META_CLAUSE_START = /(?:也)?不与|不能当作|不能作为|不能与|不要与|只与|不计算|不参与|不按|不属于[^，。；]*促销|相近[^，。；]*单独比较|因此按实际[^，。；]*价格参考|因此只作任选促销展示|仍属于同一种[^，。；]*比价组/;

function cleanClause(clause) {
  if (!ITEM_DESCRIPTION_META_PATTERN.test(clause)) return clause.trim();

  const marker = clause.search(META_CLAUSE_START);
  if (marker >= 0) {
    const retained = clause
      .slice(0, marker)
      .replace(/[，,；;\s]*(?:也|但|因此|所以|因为)?\s*$/, '')
      .trim();
    if (retained && !ITEM_DESCRIPTION_META_PATTERN.test(retained)) return retained;
  }

  // A residual clause is entirely about the comparison engine. Dropping it is
  // safer and clearer than exposing implementation detail to the shopper.
  return '';
}

export function sanitizeItemDescriptionZh(value) {
  let text = String(value || '').trim();
  if (!text) return text;
  for (const [pattern, replacement] of USEFUL_REWRITES) text = text.replace(pattern, replacement);
  if (!ITEM_DESCRIPTION_META_PATTERN.test(text)) return text;

  const sentences = text
    .split('。')
    .flatMap(sentence => sentence.split('；'))
    .map(cleanClause)
    .filter(Boolean);

  return sentences
    .join('。')
    .replace(/。{2,}/g, '。')
    .replace(/[，,；;]+。/g, '。')
    .replace(/[，,；;\s]+$/g, '')
    .concat(sentences.length ? '。' : '');
}
