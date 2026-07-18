const BASE_URL = 'https://backflipp.wishabi.com/flipp';
const TIMEOUT_MS = 15_000;
const RETRIES = 3;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const normalized = value => String(value || '').trim().toLowerCase();

async function fetchJson(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => value !== undefined && value !== null && url.searchParams.set(key, String(value)));
  let lastError;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'aarhus-grocery-deals/0.3 (+personal price comparison)' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (response.status === 429 || response.status >= 500) {
        await sleep(600 * 2 ** attempt);
        continue;
      }
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES - 1) await sleep(600 * 2 ** attempt);
    }
  }
  throw lastError || new Error('Flipp API request failed');
}

export async function fetchFlyers(postalCode, fetchPage = fetchJson) {
  const payload = await fetchPage('/flyers', { postal_code: postalCode });
  if (!payload || !Array.isArray(payload.flyers)) throw new Error('Flipp flyers response must contain a flyers array');
  return payload.flyers;
}

export async function fetchFlyerItems(flyerId, postalCode, fetchPage = fetchJson) {
  const payload = await fetchPage(`/flyers/${flyerId}`, { postal_code: postalCode });
  if (!payload || !Array.isArray(payload.items)) throw new Error('Flipp flyer response must contain an items array');
  return payload.items;
}

export function chooseCurrentFlyer(flyers, source, now = new Date()) {
  const merchant = normalized(source.merchant);
  const acceptedNames = source.flyerNames.map(normalized);
  const matching = flyers.filter(flyer => normalized(flyer.merchant) === merchant && acceptedNames.includes(normalized(flyer.name)));
  const current = matching.filter(flyer => new Date(flyer.valid_from) <= now && new Date(flyer.valid_to) >= now);
  current.sort((a, b) => new Date(b.valid_from) - new Date(a.valid_from));
  return current[0] || null;
}

const CATEGORY_RULES = [
  ['snacks', '零食或甜品优惠。', /\b(snacks?|chips?|crackers?|candy|chocolates?|bars?|nuts?|popcorn|pretzels?|cookies?|goldfish|crisps?)\b/i],
  ['drinks', '饮料优惠。', /\b(juice|soda|cola|water|drink|beverage|beer|wine|coffee|tea)\b/i],
  ['seafood', '鱼类或海鲜优惠。', /\b(fish|salmon|shrimp|seafood|tuna|crab|lobster|tilapia|cod)\b/i],
  ['meat', '肉类或熟食优惠。', /\b(chicken|beef|steak|pork|turkey|sausage|bacon|ham|pepperoni|roast|burger|ground chuck|ground meat|lamb|meat|deli)\b/i],
  ['bakery', '面包或烘焙食品优惠。', /\b(bread|bakery|bagel|bun|roll|muffin|cake|pie|croissant|cookie|toast|tortilla)\b/i],
  ['frozen', '冷冻食品优惠。', /\b(frozen|ice cream|pizza|popsicle|waffle)\b/i],
  ['produce', '蔬菜水果类优惠。', /\b(apples?|bananas?|oranges?|lemons?|limes?|grapes?|berries|strawberries|blueberries|peaches|pears?|plums?|melons?|watermelons?|avocados?|tomatoes|potatoes|onions?|mushrooms?|lettuce|salad|spinach|broccoli|peppers?|corn|carrots?|cucumbers?|produce|fruits?|vegetables?)\b/i],
  ['dairy', '乳制品或鸡蛋优惠。', /\b(milk|cheese|yogurt|yoghurt|egg|eggs|butter|cream|cottage cheese)\b/i],
  ['pantry', '主食、罐头或调味品优惠。', /\b(rice|pasta|noodle|cereal|oatmeal|flour|sugar|oil|sauce|soup|bean|beans|syrup|jam|jelly|seasoning|condiment|coffee|tea|k-cup)\b/i],
  ['baby', '婴幼儿食品或用品优惠。', /\b(baby|infant|toddler|diaper|pampers|formula)\b/i],
  ['household', '家庭清洁或纸品优惠。', /\b(detergent|cleaner|dishwasher|tissue|paper towel|trash bag|foil|storage bag|laundry)\b/i],
  ['personal', '个人护理用品优惠。', /\b(shampoo|conditioner|soap|body wash|toothpaste|deodorant|razor|vitamin|supplement)\b/i],
  ['pet', '宠物食品或用品优惠。', /\b(dog|cat|pet food|pet treat)\b/i],
];

export function classifyFlippItem(name) {
  const match = CATEGORY_RULES.find(([, , pattern]) => pattern.test(String(name || '')));
  if (!match) return null;
  return { categoryId: match[0], zhExplanation: match[1] };
}

function httpsUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === 'http:') url.protocol = 'https:';
    return url.toString();
  } catch {
    return null;
  }
}

export function buildFlippFlyerUrl(flyerId, { postalCode, locationSlug }) {
  const id = Number(flyerId);
  const postal = String(postalCode || '').trim();
  const location = String(locationSlug || '').trim().toLowerCase();
  if (!Number.isInteger(id) || id < 1) throw new Error('Flipp flyer URL requires a positive flyer ID');
  if (!/^\d{5}$/.test(postal)) throw new Error('Flipp flyer URL requires a 5-digit postal code');
  if (!/^[a-z0-9-]+$/.test(location)) throw new Error('Flipp flyer URL requires a safe location slug');
  return `https://flipp.com/en-us/${location}/flyer/${id}?postal_code=${postal}`;
}

export function buildFlippItemUrl(itemId, flyer, { postalCode, locationSlug }) {
  const id = Number(itemId);
  const postal = String(postalCode || '').trim();
  const location = String(locationSlug || '').trim().toLowerCase();
  const itemSlug = `${flyer?.merchant || ''}-${flyer?.name || ''}`
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!Number.isInteger(id) || id < 1) throw new Error('Flipp item URL requires a positive item ID');
  if (!/^\d{5}$/.test(postal)) throw new Error('Flipp item URL requires a 5-digit postal code');
  if (!/^[a-z0-9-]+$/.test(location)) throw new Error('Flipp item URL requires a safe location slug');
  if (!itemSlug) throw new Error('Flipp item URL requires flyer merchant and name');
  return `https://flipp.com/en-us/${location}/item/${id}-${itemSlug}?postal_code=${postal}`;
}

export function normalizeFlippItems(items, { storeId, flyer, seenAt, postalCode, locationSlug }) {
  const flyerUrl = buildFlippFlyerUrl(flyer.id, { postalCode, locationSlug });
  const deduped = new Map();

  for (const item of items) {
    const name = String(item.name || '').trim();
    const price = Number(item.price);
    const category = classifyFlippItem(name);
    if (item.display_type !== 1 || !name || !Number.isFinite(price) || price <= 0 || !category) continue;

    // Retailer campaign URLs in print_id/ttm_url frequently land on a generic
    // promotion. Flipp's item ID opens the matching offer card directly while
    // the location slug and postal code keep the route pinned to Atlanta.
    const retailerUrl = httpsUrl(item.ttm_url) || httpsUrl(item.print_id);
    const itemUrl = buildFlippItemUrl(item.id, flyer, { postalCode, locationSlug });
    const key = `${normalized(name)}|${price}|${item.valid_from || flyer.valid_from}|${item.valid_to || flyer.valid_to}`;
    if (deduped.has(key)) continue;

    deduped.set(key, {
      canonicalKey: `flipp|${storeId}|${item.id}`,
      storeId,
      originalName: name,
      brand: item.brand || null,
      zhExplanation: category.zhExplanation,
      categoryId: category.categoryId,
      comparisonGroup: category.categoryId,
      price,
      currency: 'USD',
      validFrom: item.valid_from || flyer.valid_from,
      validUntil: item.valid_to || flyer.valid_to,
      lastSeenAt: seenAt,
      status: 'current',
      imageUrl: httpsUrl(item.cutout_image_url),
      sourceUrl: itemUrl,
      retailerUrl,
      flyerUrl,
      flyerId: flyer.id,
      flyerName: flyer.name,
      itemId: Number(item.id),
      sourceLocation: {
        status: 'direct',
        pageNumber: null,
        positionLabel: 'Flipp 商品卡片',
        deepLink: itemUrl,
        verifiedAt: seenAt,
        method: 'flipp-item-id',
      },
    });
  }

  return [...deduped.values()];
}
