import { offerSearchScore } from './search-ranking.js?v=25';

const state = {
  data: null,
  atlantaData: null,
  route: { view: 'home', id: null },
  search: '',
  touchStartX: null,
  touchStartY: null,
  touchStartedInControl: false,
  locationId: null,
  storeFilters: [],
  storeFilterScroll: {},
  storeCategoryByStore: {},
  shopping: {},
  completedListOpen: false,
  chrome: { topHidden: false, bottomHidden: false },
  reader: { categoryId: null, storeFilterKey: '', index: 0 },
  readerTransitioning: false,
  suppressReaderClickUntil: 0,
  refresh: { status: 'idle', locationId: null, checkedAt: null, error: null },
  readerStoreFilterOpen: false,
  serviceWorkerRegistration: null,
};

const LOCATION_KEY = 'grocery-deals-location-v1';
const SHOPPING_KEY = 'grocery-deals-shopping-v1';
const ATLANTA_EASTER_EGG_ENABLED = new URLSearchParams(globalThis.location?.search || '').get('city') === 'atlanta';
const AARHUS_LOCATION = {
    id: 'aarhus-v',
    label: 'Aarhus 全市',
    radiusLabel: 'Aarhus Kommune',
    mode: 'items',
    descriptionZh: '覆盖 Aarhus 市区与 Aarhus Kommune 有公开促销单的主要食品连锁；每天更新并按可比规格比较。',
};
const ATLANTA_ARCHIVE_LOCATION = {
    id: 'atlanta-westside',
    label: 'Atlanta Westside · 历史彩蛋',
    radiusLabel: '10 km',
    mode: 'items',
    descriptionZh: '已冻结的历史数据，不再自动更新，也不属于当前 Aarhus 服务范围。',
};
const LOCATIONS = ATLANTA_EASTER_EGG_ENABLED
  ? [AARHUS_LOCATION, ATLANTA_ARCHIVE_LOCATION]
  : [AARHUS_LOCATION];

const ATLANTA_STORES = [
  {
    id: 'kroger-howell-mill',
    name: 'Kroger Howell Mill Square',
    color: '#1B4D8C',
    shortAddress: '1715 Howell Mill Rd NW, Atlanta, GA 30318',
    distanceLabel: 'Westside 10 km 购物圈',
    membership: '部分优惠需 Kroger Plus',
    descriptionZh: '大型日常食品超市。官方 Weekly Ad 会按所选门店显示当周促销。',
    website: 'https://www.kroger.com/stores/grocery/ga/atlanta/howell-mill-square/011/00346',
    flyerUrl: 'https://www.kroger.com/weeklyad',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Kroger+1715+Howell+Mill+Rd+NW+Atlanta',
  },
  {
    id: 'publix-howell-mill',
    name: 'Publix Howell Mill Village',
    color: '#3E7B37',
    shortAddress: '2020 Howell Mill Rd NW, Atlanta, GA 30318',
    distanceLabel: 'Westside 10 km 购物圈',
    membership: '官方 Weekly Ad',
    descriptionZh: '生鲜、熟食和烘焙选择较多；优惠以 Publix 官方 Weekly Ad 为准。',
    website: 'https://www.publix.com/locations/1119-howell-mill-village',
    flyerUrl: 'https://www.publix.com/savings/weekly-ad',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Publix+2020+Howell+Mill+Rd+NW+Atlanta',
  },
  {
    id: 'whole-foods-midtown',
    name: 'Whole Foods Market Midtown',
    color: '#315C35',
    shortAddress: '22 14th St NW, Atlanta, GA 30309',
    distanceLabel: 'Westside 10 km 购物圈',
    membership: 'Prime 会员价会单独显示',
    descriptionZh: '有机、生鲜和熟食较多；门店页直接展示本周普通优惠和 Prime 会员优惠。',
    website: 'https://www.wholefoodsmarket.com/stores/midtownatlanta',
    flyerUrl: 'https://www.wholefoodsmarket.com/stores/midtownatlanta',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Whole+Foods+22+14th+St+NW+Atlanta',
  },
  {
    id: 'target-midtown',
    name: 'Target Atlanta Midtown',
    color: '#CC0000',
    shortAddress: '375 18th St, Atlanta, GA 30363',
    distanceLabel: 'Westside 10 km 购物圈',
    membership: 'Target Circle 优惠可能需账户',
    descriptionZh: '综合商店内含食品区；官方 Grocery 页面会显示当前门店促销和提货选项。',
    website: 'https://www.target.com/sl/atlanta-midtown/2137',
    flyerUrl: 'https://www.target.com/sl/atlanta-midtown/2137/grocery',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Target+375+18th+St+Atlanta',
  },
  {
    id: 'walmart-mlk',
    name: 'Walmart Neighborhood Market',
    color: '#1A5FAF',
    shortAddress: '835 Martin Luther King Jr Dr NW, Atlanta, GA 30314',
    distanceLabel: 'Westside 10 km 购物圈',
    membership: 'Rollback 通常无需会员',
    descriptionZh: '社区型食品门店；官方页面显示 Rollback、提货和配送选项。',
    website: 'https://www.walmart.com/store/7601-atlanta-ga',
    flyerUrl: 'https://www.walmart.com/store/7601-atlanta-ga/shopping-services',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Walmart+835+Martin+Luther+King+Jr+Dr+NW+Atlanta',
  },
];

const ATLANTA_CATEGORY_LABELS = {
  vegetables: ['🥬', '蔬菜'],
  fruit: ['🍎', '水果'],
  produce_mixed: ['🥗', '果蔬组合'],
  fresh_meat: ['🥩', '生鲜肉类'],
  minced_meat: ['🥟', '肉末'],
  bacon: ['🥓', '培根'],
  sausages: ['🌭', '香肠'],
  deli_meat: ['🥪', '冷切与肉片'],
  prepared_meat: ['🍖', '肉类制成品'],
  deli_prepared: ['🥓', '熟食、香肠与加工肉'],
  seafood: ['🐟', '鱼类海鲜'],
  yoghurt: ['🥣', '酸奶'],
  cheese: ['🧀', '奶酪'],
  dairy: ['🥛', '牛奶、奶油与鸡蛋'],
  bakery: ['🍞', '面包烘焙'],
  frozen: ['🧊', '冷冻食品'],
  potato_products: ['🍟', '土豆制成品'],
  sauces_condiments: ['🥫', '酱料与佐料'],
  cooking_oils: ['🫒', '食用油'],
  canned_pickled: ['🫙', '罐头与腌渍食品'],
  pantry: ['🥫', '主食调味'],
  snacks: ['🍪', '零食甜品'],
  drinks: ['🥤', '饮料'],
  alcohol: ['🍷', '啤酒与葡萄酒'],
  baby: ['🍼', '婴幼儿用品'],
  household: ['🧻', '家庭日用品'],
  paper_products: ['🧻', '生活纸品'],
  personal: ['🧴', '个人护理'],
  pet: ['🐾', '宠物用品'],
};

const ATLANTA_CATEGORIES = Object.entries(ATLANTA_CATEGORY_LABELS).map(([id, [emoji, nameZh]]) => ({
  id,
  emoji,
  nameZh,
  color: '#315f51',
  descriptionZh: `${nameZh}优惠。保留商品原名、价格、有效期和来源。`,
}));

const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') node.className = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value !== null && value !== undefined) node.setAttribute(key, value);
  });
  (Array.isArray(children) ? children : [children]).forEach(child => {
    if (child === null || child === undefined) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return node;
};

const SVG_NS = 'http://www.w3.org/2000/svg';
function svgIcon(kind) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const iconPaths = {
    copy: ['M8 8h10v12H8z', 'M6 16H4V4h10v2'],
    location: ['M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11z', 'M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
    refresh: ['M20 11a8 8 0 1 0-2.34 5.66', 'M20 4v7h-7'],
    search: ['M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z', 'M16 16l5 5'],
  };
  const paths = iconPaths[kind] || iconPaths.location;
  paths.forEach(data => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', data);
    svg.append(path);
  });
  return svg;
}

const formatDate = iso => {
  if (!iso) return '未知';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(d);
};
const formatUpdated = iso => new Intl.DateTimeFormat('zh-CN', {
  month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(iso));
const money = value => Number.isFinite(value) ? `${Number(value).toFixed(value % 1 ? 2 : 0)} DKK` : '价格待确认';
const usd = value => Number.isFinite(value) ? `$${Number(value).toFixed(2)}` : '价格待确认';
const now = () => new Date();
const activeLocation = () => LOCATIONS.find(location => location.id === state.locationId) || LOCATIONS[0];
const isAarhusLocation = () => activeLocation().id === 'aarhus-v';
const activeData = () => isAarhusLocation() ? state.data : state.atlantaData;
const activeStores = () => isAarhusLocation() ? state.data.stores : ATLANTA_STORES;
const activeCategories = () => activeData()?.categories || (isAarhusLocation() ? state.data.categories : ATLANTA_CATEGORIES);
const activeComparisonGroups = () => activeData()?.comparisonGroups || state.data.comparisonGroups;
const currentOffers = () => (activeData()?.offers || []).filter(o => (
  !['expired', 'withdrawn'].includes(o.status)
  && (!o.validUntil || new Date(o.validUntil) >= now())
));
const atlantaOffers = () => (state.atlantaData?.offers || []).filter(o => o.status !== 'expired');
const purchasableNow = () => currentOffers().filter(o => new Date(o.validFrom) <= now() && new Date(o.validUntil) >= now());
const upcomingOffers = () => currentOffers().filter(o => new Date(o.validFrom) > now());
const firstSentence = text => String(text || '').split(/(?<=[。！？])/)[0] || '查看中文说明';
const availabilityBadge = o => new Date(o.validFrom) > now() ? `下期开始 ${formatDate(o.validFrom)}` : '现在能买';
const isMobileReadingMode = () => Boolean(
  globalThis.matchMedia?.('(max-width: 699px)').matches
  || new URLSearchParams(location.search).get('preview') === 'mobile'
);
const storeById = id => activeStores().find(s => s.id === id);
const categoryById = id => activeCategories().find(c => c.id === id);
const offerMoney = offer => offer.currency === 'USD' ? usd(offer.price) : money(offer.price);
const locationShopping = () => state.shopping[state.locationId] || {};
const shoppingOfferKey = offer => offer.productKey || offer.canonicalKey;
const shoppingEntry = offer => locationShopping()[shoppingOfferKey(offer)] || null;
const shoppingCount = () => Object.values(locationShopping()).filter(entry => entry.status === 'wanted').length;
const shoppingQuantity = offer => {
  const quantity = shoppingEntry(offer)?.quantity;
  return Number.isInteger(quantity) && quantity >= 0 ? quantity : 1;
};

function orderedCategoryIds(offers) {
  const present = new Set(offers.map(offer => offer.categoryId).filter(Boolean));
  const configured = activeCategories().map(category => category.id).filter(id => present.has(id));
  const configuredSet = new Set(configured);
  const unknown = [...present]
    .filter(id => !configuredSet.has(id))
    .sort((a, b) => String(a).localeCompare(String(b), 'zh-CN'));
  return [...configured, ...unknown];
}

function shoppingTotal(offers) {
  const priced = offers.filter(offer => Number.isFinite(offer.price));
  const value = priced.reduce((sum, offer) => sum + offer.price * shoppingQuantity(offer), 0);
  const quantity = offers.reduce((sum, offer) => sum + shoppingQuantity(offer), 0);
  const currency = priced.find(offer => offer.currency)?.currency || (isAarhusLocation() ? 'DKK' : 'USD');
  return {
    value,
    display: currency === 'USD' ? usd(value) : money(value),
    amount: currency === 'USD' ? `$${value.toFixed(2)}` : Number(value).toFixed(value % 1 ? 2 : 0),
    currency,
    quantity,
    pricedCount: priced.length,
    missingCount: offers.length - priced.length,
  };
}

const dataFileForLocation = locationId => locationId === 'atlanta-westside'
  ? 'data/atlanta_offers.json'
  : 'data/current_offers.json';

const comparableData = data => JSON.stringify(data);

async function refreshActiveData() {
  if (state.refresh.status === 'checking') return;
  const locationId = state.locationId;
  const currentData = activeData();
  state.refresh = { status: 'checking', locationId, checkedAt: null, error: null };
  render({ preserveScroll: true });

  try {
    const dataUrl = `${dataFileForLocation(locationId)}?refresh=${Date.now()}`;
    const response = await fetch(dataUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const nextData = await response.json();
    if (!nextData?.metadata || !Array.isArray(nextData.offers)) throw new Error('数据文件格式不完整');

    const changed = comparableData(nextData) !== comparableData(currentData);
    if (changed) {
      if (locationId === 'atlanta-westside') state.atlantaData = nextData;
      else state.data = nextData;
    }
    state.refresh = {
      status: changed ? 'updated' : 'unchanged',
      locationId,
      checkedAt: new Date().toISOString(),
      error: null,
    };
  } catch (error) {
    state.refresh = {
      status: 'error',
      locationId,
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }

  if (state.locationId === locationId) render({ preserveScroll: true });
}

function legacyCopyPlainText(value) {
  const textarea = el('textarea', { 'aria-hidden': 'true' }, value);
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.setAttribute('readonly', '');
  document.body.append(textarea);
  textarea.select();
  textarea.setSelectionRange(0, value.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    textarea.remove();
  }
  if (!copied) throw new Error('copy unavailable');
}

async function copyPlainText(value) {
  let clipboardError = null;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch (error) {
      clipboardError = error;
    }
  }
  try {
    legacyCopyPlainText(value);
  } catch (error) {
    throw clipboardError || error;
  }
}

function distanceKm(from, to) {
  const radians = value => value * Math.PI / 180;
  const earthKm = 6371;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestPublicStore(position, stores) {
  return stores
    .map(store => ({ store, distance: distanceKm(position, store) }))
    .sort((a, b) => a.distance - b.distance)[0] || null;
}

function mapsSearchUrl(store) {
  const query = [store.name, store.address].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function nearbyStoreControl(store) {
  const sourceName = store?.sourceName || store?.name || '未知商店';
  const result = el('div', { class: 'nearby-result', role: 'status', 'aria-live': 'polite' }, '点击定位后，仅在本机计算最近门店');
  const copyButton = el('button', {
    class: 'copy-store-btn', type: 'button', title: '复制商店原名', 'aria-label': `复制商店原名 ${sourceName}`,
    onClick: async event => {
      const button = event.currentTarget;
      try {
        await copyPlainText(sourceName);
        button.classList.add('copied');
        button.setAttribute('aria-label', `已复制 ${sourceName}`);
        setTimeout(() => {
          button.classList.remove('copied');
          button.setAttribute('aria-label', `复制商店原名 ${sourceName}`);
        }, 1400);
      } catch {
        result.textContent = `无法自动复制，请长按：${sourceName}`;
      }
    },
  }, svgIcon('copy'));
  const locateButton = el('button', {
    class: 'locate-store-btn', type: 'button',
    onClick: event => {
      const button = event.currentTarget;
      const branches = Array.isArray(store?.nearbyStores) ? store.nearbyStores : [];
      if (!navigator.geolocation) {
        result.replaceChildren(el('span', {}, '浏览器不支持定位。'), store?.mapUrl ? el('a', { href: store.mapUrl, target: '_blank', rel: 'noopener noreferrer' }, '搜索门店 ↗') : null);
        return;
      }
      if (!branches.length) {
        result.replaceChildren(el('span', {}, '该来源暂未提供 Aarhus 门店坐标。'), store?.mapUrl ? el('a', { href: store.mapUrl, target: '_blank', rel: 'noopener noreferrer' }, '搜索门店 ↗') : null);
        return;
      }
      button.disabled = true;
      button.classList.add('checking');
      result.textContent = '正在请求手机定位权限…';
      navigator.geolocation.getCurrentPosition(position => {
        const nearest = nearestPublicStore({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }, branches);
        button.disabled = false;
        button.classList.remove('checking');
        if (!nearest) {
          result.textContent = '没有找到可用门店坐标';
          return;
        }
        const distance = nearest.distance < 1
          ? `${Math.round(nearest.distance * 1000)} 米`
          : `${nearest.distance.toFixed(1)} 公里`;
        result.replaceChildren(
          el('strong', {}, nearest.store.name),
          el('span', {}, `${nearest.store.address} · 约 ${distance}`),
          el('a', { href: mapsSearchUrl(nearest.store), target: '_blank', rel: 'noopener noreferrer' }, '地图 ↗'),
        );
      }, error => {
        button.disabled = false;
        button.classList.remove('checking');
        const message = error.code === 1 ? '定位权限未开启；不会影响浏览优惠。' : '暂时无法取得位置。';
        result.replaceChildren(el('span', {}, message), store?.mapUrl ? el('a', { href: store.mapUrl, target: '_blank', rel: 'noopener noreferrer' }, '手动搜索 ↗') : null);
      }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 });
    },
  }, [svgIcon('location'), el('span', {}, '按当前位置找最近门店')]);

  return el('div', { class: 'nearby-store-control' }, [
    el('div', { class: 'original-store-name' }, [copyButton, el('strong', {}, sourceName)]),
    locateButton,
    result,
  ]);
}

function saveShopping() {
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(state.shopping));
}

function setShoppingStatus(offer, status) {
  const entries = { ...locationShopping() };
  const key = shoppingOfferKey(offer);
  if (!status) delete entries[key];
  else entries[key] = {
    status,
    quantity: Number.isInteger(entries[key]?.quantity) && entries[key].quantity >= 0 ? entries[key].quantity : 1,
    addedAt: entries[key]?.addedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    originalName: offer.originalName,
    storeId: offer.storeId,
  };
  state.shopping = { ...state.shopping, [state.locationId]: entries };
  saveShopping();
  render({ preserveScroll: true });
}

function updateShoppingQuantityUi(offer) {
  const key = shoppingOfferKey(offer);
  const card = [...document.querySelectorAll('.offer-card[data-shopping-key]')]
    .find(candidate => candidate.dataset.shoppingKey === key);
  if (!card || state.route.view !== 'shopping') {
    render({ preserveScroll: true });
    return;
  }

  const quantity = shoppingQuantity(offer);
  const output = card.querySelector('[data-quantity-value]');
  const decrease = card.querySelector('[data-quantity-action="decrease"]');
  const lineTotal = card.querySelector('.shopping-line-total');
  if (output) {
    output.value = String(quantity);
    output.textContent = String(quantity);
  }
  if (decrease) decrease.disabled = quantity === 0;
  if (lineTotal) {
    const subtotal = Number.isFinite(offer.price)
      ? (offer.currency === 'USD' ? usd(offer.price * quantity) : money(offer.price * quantity))
      : '价格待确认';
    lineTotal.textContent = `本项 ${subtotal}`;
  }

  const entries = locationShopping();
  const allWanted = currentOffers().filter(candidate => entries[shoppingOfferKey(candidate)]?.status === 'wanted');
  const visibleWanted = filterOffersByStore(allWanted);
  const total = shoppingTotal(allWanted);
  const visibleTotal = shoppingTotal(visibleWanted);
  const totalBar = document.querySelector('.shopping-total');
  const number = totalBar?.querySelector('.shopping-total-number');
  const summary = totalBar?.querySelector('.shopping-total-summary');
  const filtered = totalBar?.querySelector('.shopping-total-filtered');
  if (number) number.textContent = total.amount;
  if (summary) summary.textContent = `${allWanted.length} 项商品 · 合计 ${total.quantity} 份${total.missingCount ? ` · ${total.missingCount} 项价格待确认` : ''}`;
  if (filtered) filtered.textContent = `已选 ${state.storeFilters.length} 家商店 · ${visibleWanted.length} 项 / ${visibleTotal.quantity} 份 · ${visibleTotal.display}`;
}

function updateShoppingQuantity(offer, change) {
  const entries = { ...locationShopping() };
  const key = shoppingOfferKey(offer);
  const existing = entries[key] || {
    status: 'wanted',
    addedAt: new Date().toISOString(),
    originalName: offer.originalName,
    storeId: offer.storeId,
  };
  const current = Number.isInteger(existing.quantity) && existing.quantity >= 0 ? existing.quantity : 1;
  entries[key] = {
    ...existing,
    quantity: Math.max(0, current + change),
    updatedAt: new Date().toISOString(),
  };
  state.shopping = { ...state.shopping, [state.locationId]: entries };
  saveShopping();
  updateShoppingQuantityUi(offer);
}

function filterOffersByStore(offers) {
  if (!state.storeFilters.length) return offers;
  const selected = new Set(state.storeFilters);
  return offers.filter(offer => selected.has(offer.storeId));
}

const hasStoreFilters = () => state.storeFilters.length > 0;
const storeFilterKey = () => state.storeFilters.join(',');

function storeFilterScrollKey(scope = 'main') {
  return [state.locationId || 'default', state.route.view, state.route.id || '', scope].join(':');
}

function captureStoreFilterScroll(root) {
  root.querySelectorAll('[data-store-filter-scroll-key]').forEach(row => {
    const key = row.dataset.storeFilterScrollKey;
    if (key) state.storeFilterScroll[key] = row.scrollLeft;
  });
}

function restoreStoreFilterScroll(root) {
  root.querySelectorAll('[data-store-filter-scroll-key]').forEach(row => {
    const key = row.dataset.storeFilterScrollKey;
    if (key && Number.isFinite(state.storeFilterScroll[key])) row.scrollLeft = state.storeFilterScroll[key];
  });
}
const priceScopeLabel = () => hasStoreFilters() ? '已选商店' : '全局';

function storeFilterSummary(offers) {
  if (!hasStoreFilters()) return `全部商店 · ${offers.length} 项`;
  const names = state.storeFilters.map(id => storeById(id)?.name || id);
  const label = names.length <= 2 ? names.join(' + ') : `已选 ${names.length} 家商店`;
  return `${label} · ${filterOffersByStore(offers).length} 项`;
}

const offerPeriod = offer => new Date(offer.validFrom) > now() ? 'upcoming' : 'current';

function globalPriceComparison(offer) {
  const groupDefinition = activeComparisonGroups()?.[offer.comparisonGroup];
  if (!groupDefinition || groupDefinition.comparable === false || /(?:^|_)other$|mixed|_offer$/.test(offer.comparisonGroup)) return null;
  const unit = String(offer.unitPriceUnit || '');
  if (!Number.isFinite(offer.unitPriceValue) || !/(?:\/kg|\/L)$/.test(unit)) return null;
  const period = offerPeriod(offer);
  const scopedOffers = filterOffersByStore(currentOffers());
  const candidates = scopedOffers.filter(candidate =>
    candidate.comparisonGroup === offer.comparisonGroup &&
    candidate.currency === offer.currency &&
    candidate.unitPriceUnit === unit &&
    Number.isFinite(candidate.unitPriceValue) &&
    candidate.status !== 'unconfirmed' &&
    offerPeriod(candidate) === period
  );
  const comparable = candidates;
  if (!comparable.length) return null;
  const metric = candidate => candidate.unitPriceValue;
  const minimum = Math.min(...comparable.map(metric));
  const value = metric(offer);
  const tolerance = Math.max(0.000001, Math.abs(minimum) * 0.000001);
  if (!Number.isFinite(value)) return null;
  const difference = Math.max(0, value - minimum);
  const isBest = difference <= tolerance;
  const bestOffers = comparable.filter(candidate => Math.abs(metric(candidate) - minimum) <= tolerance);
  let currentMinimum = null;
  if (period === 'upcoming') {
    const currentCandidates = scopedOffers.filter(candidate =>
      candidate.comparisonGroup === offer.comparisonGroup &&
      candidate.currency === offer.currency &&
      candidate.unitPriceUnit === unit &&
      candidate.status !== 'unconfirmed' &&
      offerPeriod(candidate) === 'current' &&
      Number.isFinite(candidate.unitPriceValue)
    );
    if (currentCandidates.length) currentMinimum = Math.min(...currentCandidates.map(metric));
  }
  const futureSaving = period === 'upcoming' && currentMinimum !== null ? currentMinimum - value : null;
  const futureBetter = isBest && futureSaving !== null && futureSaving > tolerance;
  return {
    isBest,
    label: period === 'upcoming'
      ? `${futureBetter ? '下期新低' : `下期${priceScopeLabel()}最低`}单位价`
      : `本期${priceScopeLabel()}最低单位价`,
    ties: bestOffers.length,
    bestOffers,
    difference,
    basis: 'unit',
    period,
    futureBetter,
    futureSaving,
  };
}

function priceGapText(offer, comparison) {
  if (!comparison) return null;
  const periodLabel = comparison.period === 'upcoming' ? '下期' : '本期';
  if (comparison.isBest) {
    if (comparison.futureBetter) {
      const saving = comparison.basis === 'unit'
        ? `${comparison.futureSaving.toFixed(2)} ${String(offer.unitPriceDisplay || '').replace(/^\s*[\d.,]+\s*/, '') || 'DKK/单位'}`
        : offer.currency === 'USD' ? `$${comparison.futureSaving.toFixed(2)}` : `${comparison.futureSaving.toFixed(2)} DKK`;
      return `下期最低，比本期最低再低 ${saving}${comparison.ties > 1 ? ` · ${comparison.ties} 项并列` : ''}`;
    }
    return comparison.ties > 1 ? `与${periodLabel}最低相同 · ${comparison.ties} 项并列` : `当前为${periodLabel}最低`;
  }
  if (comparison.basis === 'unit') {
    const unitLabel = String(offer.unitPriceDisplay || '').replace(/^\s*[\d.,]+\s*/, '') || (offer.currency === 'USD' ? 'USD/单位' : 'DKK/单位');
    return `比${periodLabel}最低贵 ${comparison.difference.toFixed(2)} ${unitLabel}`;
  }
  return offer.currency === 'USD'
    ? `比${periodLabel}最低贵 $${comparison.difference.toFixed(2)}`
    : `比${periodLabel}最低贵 ${comparison.difference.toFixed(2)} DKK`;
}

function openLowestModal(comparison) {
  if (!comparison?.bestOffers?.length) return;
  let index = 0;
  const dialog = el('dialog', { class: 'lowest-dialog', 'aria-label': `${comparison.period === 'upcoming' ? '下期' : '本期'}最低价商品` });
  const content = el('div', { class: 'lowest-dialog-content' });

  const renderSlide = () => {
    const offer = comparison.bestOffers[index];
    const store = storeById(offer.storeId);
    const href = offer.sourceLocation?.deepLink || offer.sourceUrl;
    content.replaceChildren(
      el('div', { class: 'lowest-dialog-head' }, [
        el('div', {}, [
          el('strong', {}, comparison.futureBetter ? '下期价格创新低' : `${comparison.period === 'upcoming' ? '下期' : '本期'}最低价商品`),
          el('span', {}, `${index + 1} / ${comparison.bestOffers.length}`),
        ]),
        el('button', { class: 'dialog-close', type: 'button', 'aria-label': '关闭最低价商品', onClick: () => dialog.close() }, '×'),
      ]),
      el('article', { class: 'lowest-slide', style: `--store-color:${store?.color || '#315f51'}` }, [
        offer.imageUrl ? el('img', { src: offer.imageUrl, alt: offer.originalName, loading: 'eager', referrerpolicy: 'no-referrer' }) : null,
        el('span', { class: 'badge store' }, store?.name || offer.storeId),
        el('h3', {}, offer.productNameZh || offer.originalName),
        offer.productNameZh && offer.productNameZh !== offer.originalName
          ? el('p', { class: 'original-product-name' }, offer.originalName)
          : null,
        el('p', {}, offer.zhExplanation),
        el('div', { class: 'lowest-slide-price' }, [
          el('strong', {}, offerMoney(offer)),
          offer.unitPriceDisplay ? el('span', {}, offer.unitPriceDisplay) : null,
        ]),
        el('small', {}, `${formatDate(offer.validFrom)}—${formatDate(offer.validUntil)} · ${store?.shortAddress || ''}`),
        href ? el('a', { class: 'source-link', href, target: '_blank', rel: 'noopener noreferrer' }, '打开该最低价商品来源 ↗') : null,
      ]),
      el('div', { class: 'lowest-dialog-nav' }, [
        el('button', { type: 'button', disabled: index === 0 ? '' : null, onClick: () => { index -= 1; renderSlide(); } }, '← 上一个'),
        el('span', {}, comparison.bestOffers.length > 1 ? `${comparison.bestOffers.length} 个并列最低，可左右切换` : '这是当前唯一最低价'),
        el('button', { type: 'button', disabled: index === comparison.bestOffers.length - 1 ? '' : null, onClick: () => { index += 1; renderSlide(); } }, '下一个 →'),
      ]),
    );
  };

  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  renderSlide();
  dialog.append(content);
  document.body.append(dialog);
  dialog.showModal();
}

async function copyOfferName(name, button) {
  const resetLabel = '复制';
  try {
    await copyPlainText(name);
    button.textContent = '已复制';
    button.classList.add('copied');
  } catch {
    button.textContent = '复制失败';
  }
  setTimeout(() => {
    button.textContent = resetLabel;
    button.classList.remove('copied');
  }, 1600);
}

function offerTitle(offer) {
  const name = offer.originalName;
  const productNameZh = offer.productNameZh || name;
  const copyButton = el('button', {
    class: 'copy-name-btn',
    type: 'button',
    title: '复制商品原名',
    'aria-label': `复制商品原名：${name}`,
  }, '复制');
  copyButton.addEventListener('click', () => copyOfferName(name, copyButton));
  return el('div', { class: 'offer-heading' }, [
    el('div', { class: 'offer-title-row' }, [el('h4', {}, productNameZh), copyButton]),
    productNameZh !== name ? el('p', { class: 'original-product-name' }, name) : null,
  ]);
}

function parseRoute() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const previousView = state.route.view;
  const nextView = params.get('view') || 'home';
  if (nextView === 'shopping' && previousView !== 'shopping') state.completedListOpen = false;
  state.route.view = nextView;
  state.route.id = params.get('id');
  state.search = params.get('q') || '';
  const requestedStores = (params.get('stores') || params.get('store') || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);
  const available = new Set(activeStores().map(store => store.id));
  state.storeFilters = [...new Set(requestedStores)].filter(id => available.has(id));
}
function go(view, id = null, extra = {}) {
  if (isMobileReadingMode()) {
    state.chrome = { topHidden: true, bottomHidden: true };
  }
  const p = new URLSearchParams({ view });
  if (id) p.set('id', id);
  if (!Object.hasOwn(extra, 'stores') && hasStoreFilters() && ['home', 'categories', 'category', 'shopping', 'search'].includes(view)) {
    p.set('stores', storeFilterKey());
  }
  Object.entries(extra).forEach(([k, v]) => v !== null && v !== undefined && v !== '' && p.set(k, v));
  location.hash = p.toString();
}

function setStoreFilter(storeId) {
  const selected = new Set(state.storeFilters);
  if (!storeId) selected.clear();
  else if (selected.has(storeId)) selected.delete(storeId);
  else selected.add(storeId);
  go(state.route.view, state.route.id, { q: state.search, stores: [...selected].join(',') });
}

function syncChromeLayout() {
  const root = document.getElementById('app');
  const topbar = root?.querySelector('.topbar');
  const bottom = root?.querySelector('.bottom-nav');
  if (!root || !bottom) return;
  root.style.setProperty('--topbar-height', `${topbar ? Math.ceil(topbar.getBoundingClientRect().height) : 0}px`);
  root.style.setProperty('--bottom-nav-height', `${Math.ceil(bottom.getBoundingClientRect().height)}px`);
  root.classList.toggle('topbar-hidden', !topbar || state.chrome.topHidden);
  root.classList.toggle('bottom-nav-hidden', state.chrome.bottomHidden);
  root.classList.toggle('mobile-reading-mode', isMobileReadingMode());
}

function toggleReadingChrome() {
  const hidden = state.chrome.topHidden && state.chrome.bottomHidden;
  state.chrome = { topHidden: !hidden, bottomHidden: !hidden };
  document.querySelector('.topbar')?.classList.toggle('collapsed', !hidden);
  document.querySelector('.bottom-nav')?.classList.toggle('collapsed', !hidden);
  requestAnimationFrame(syncChromeLayout);
}

function setStoreCategoryNavigation(open) {
  const navigation = document.querySelector('.store-category-float');
  if (!navigation) return;
  navigation.classList.toggle('open', open);
  navigation.setAttribute('aria-hidden', String(!open));
  if (!open) return;

  const currentCategoryId = state.storeCategoryByStore[state.route.id]
    || document.querySelector('.store-category-section')?.dataset.categoryId;
  navigation.querySelectorAll('.store-category-option').forEach(button => {
    button.classList.toggle('active', button.dataset.categoryId === currentCategoryId);
  });
  navigation.querySelector('.store-category-option.active')?.scrollIntoView({ block: 'nearest' });
}

function selectStoreCategory(storeId, categoryId) {
  setStoreCategoryNavigation(false);
  state.storeCategoryByStore[storeId] = categoryId;
  render();
  requestAnimationFrame(() => document.getElementById(`store-${storeId}-${categoryId}`)?.scrollIntoView({ block: 'start', behavior: 'auto' }));
}

function attachReadingChromeTap(node) {
  if (!isMobileReadingMode() || state.route.view === 'shopping') return;
  node.addEventListener('click', event => {
    if (Date.now() < state.suppressReaderClickUntil) return;
    if (event.target.closest('button, a, input, select, textarea, summary, dialog')) return;
    const x = event.clientX;
    const y = event.clientY;
    if (x < innerWidth * .18 || x > innerWidth * .82 || y < innerHeight * .18 || y > innerHeight * .82) return;
    const opening = state.chrome.topHidden && state.chrome.bottomHidden;
    toggleReadingChrome();
    if (state.route.view === 'store') setStoreCategoryNavigation(opening);
  });
}

function storeFilterBar(offers, title = '按商店筛选') {
  const stores = activeStores().filter(store => offers.some(offer => offer.storeId === store.id));
  if (stores.length < 2) return null;
  return el('section', { class: 'store-filter-panel', 'aria-label': title }, [
    el('div', { class: 'filter-label' }, [
      el('strong', {}, title),
      el('span', {}, storeFilterSummary(offers)),
    ]),
    el('div', {
      class: 'chip-row store-filter-row',
      'data-store-filter-scroll-key': storeFilterScrollKey(),
    }, [
      el('button', {
        class: `chip${hasStoreFilters() ? '' : ' active'}`,
        type: 'button',
        'aria-pressed': String(!hasStoreFilters()),
        onClick: () => setStoreFilter(null),
      }, `全部 ${offers.length}`),
      ...stores.map(store => {
        const count = offers.filter(offer => offer.storeId === store.id).length;
        const selected = state.storeFilters.includes(store.id);
        return el('button', {
          class: `chip store-filter-chip${selected ? ' active' : ''}`,
          type: 'button',
          'aria-pressed': String(selected),
          style: `--store-color:${store.color}`,
          onClick: () => setStoreFilter(store.id),
        }, `${selected ? '✓ ' : ''}${store.name} ${count}`);
      }),
    ]),
    el('p', { class: 'store-filter-help' }, '可同时选择多家；再次点击可取消。价格与最低价只在已选商店之间比较。'),
  ]);
}

function topbar() {
  const location = activeLocation();
  const metadata = activeData()?.metadata || {};
  const sourceUpdatedAt = metadata.updatedAt || new Date().toISOString();
  const contentUpdatedAt = metadata.contentUpdatedAt || sourceUpdatedAt;
  const refresh = state.refresh.locationId === state.locationId ? state.refresh : { status: 'idle' };
  const refreshText = refresh.status === 'checking'
    ? '正在检查数据文件…'
    : refresh.status === 'updated'
      ? `已取得新数据并更新 · ${formatUpdated(refresh.checkedAt)}`
      : refresh.status === 'unchanged'
        ? `已刷新，暂无新数据 · ${formatUpdated(refresh.checkedAt)}`
        : refresh.status === 'error'
          ? `刷新失败，仍显示现有数据 · ${refresh.error}`
          : null;
  const hidden = state.chrome.topHidden;
  return el('header', { class: `topbar${hidden ? ' collapsed' : ''}` }, [
    el('div', { class: 'topbar-row' }, [
      el('div', { class: 'brand' }, [
        el('div', { class: 'brand-mark' }, '菜'),
        el('div', {}, [
          el('h1', {}, '买菜口袋书'),
          el('p', {}, `${location.label} · 促销数据 ${formatUpdated(sourceUpdatedAt)} · 中文内容 ${formatUpdated(contentUpdatedAt)}`),
          refreshText ? el('p', { class: `refresh-state ${refresh.status}`, role: 'status' }, refreshText) : null,
        ]),
      ]),
      el('div', { class: 'topbar-actions' }, [
        el('button', {
          class: `icon-btn refresh-btn${refresh.status === 'checking' ? ' checking' : ''}`,
          'aria-label': refresh.status === 'checking' ? '正在检查更新' : '刷新并检查数据更新',
          title: '刷新并检查数据更新',
          disabled: refresh.status === 'checking' ? '' : null,
          onClick: refreshActiveData,
        }, [svgIcon('refresh'), el('span', {}, '更新')]),
        LOCATIONS.length > 1 ? el('button', { class: 'icon-btn', 'aria-label': '打开隐藏地点彩蛋', onClick: () => go('locations') }, '◎') : null,
        el('button', { class: 'icon-btn search-btn', 'aria-label': '搜索', onClick: () => go('search') }, [svgIcon('search'), el('span', {}, '搜索')]),
      ]),
    ]),
  ]);
}

function bottomNav() {
  const items = [
    ['home', '⌂', '首页'],
    ['categories', '▤', '分类'],
    ['stores', '⌖', '商店'],
    ['shopping', '✓', `清单${shoppingCount() ? ` ${shoppingCount()}` : ''}`],
    ['search', '⌕', '搜索'],
  ];
  const hidden = state.chrome.bottomHidden;
  return el('nav', { class: `bottom-nav${hidden ? ' collapsed' : ''}`, 'aria-label': '主导航' }, [
    el('div', { class: 'bottom-nav-items' }, items.map(([view, icon, label]) =>
      el('button', { class: state.route.view === view || (view === 'categories' && state.route.view === 'category') || (view === 'stores' && state.route.view === 'store') ? 'active' : '', onClick: () => go(view) }, [
        el('span', {}, icon), label,
      ])
    )),
  ]);
}

function locationCard(location) {
  const selected = location.id === state.locationId;
  return el('button', {
    class: `location-card${selected ? ' selected' : ''}`,
    onClick: () => {
      state.locationId = location.id;
      state.storeFilters = [];
      localStorage.setItem(LOCATION_KEY, location.id);
      go('home', null, { stores: '' });
    },
  }, [
    el('strong', {}, location.label),
    el('span', { class: 'location-radius' }, `${location.radiusLabel} 购物圈`),
    el('p', {}, location.descriptionZh),
    el('span', { class: 'location-state' }, selected ? '当前地点' : '切换到这里'),
  ]);
}

function locationsView() {
  return el('main', { class: 'content' }, [
    sectionTitle('切换购物区域', '只在当前浏览器保存选择，不保存或上传精确住址'),
    el('div', { class: 'location-grid' }, LOCATIONS.map(locationCard)),
    el('div', { class: 'privacy-note' }, [
      el('strong', {}, '隐私模式'),
      el('p', {}, '公开仓库只包含粗粒度区域和商店的公开地址。你的住址、伴侣住址、姓名和邮箱不会写入数据文件。'),
    ]),
  ]);
}

function atlantaStoreCard(store) {
  const offers = atlantaOffers().filter(offer => offer.storeId === store.id);
  const flyer = state.atlantaData?.flyers?.find(item => item.storeId === store.id);
  return el('button', { class: 'store-card atlanta-store-card', style: `--store-color:${store.color}`, onClick: () => go('store', store.id) }, [
    el('h3', {}, store.name),
    el('p', {}, `${store.shortAddress} · ${store.distanceLabel}`),
    el('div', { class: 'store-stats' }, [
      el('span', { class: 'store-stat' }, offers.length ? `${offers.length} 项站内优惠` : '暂无结构化商品'),
      el('span', { class: 'store-stat' }, store.membership),
    ]),
    el('p', {}, store.descriptionZh),
    flyer ? el('span', { class: 'store-open-hint' }, `查看 ${formatDate(flyer.validFrom)}—${formatDate(flyer.validUntil)} 的商品 →`) : el('span', { class: 'store-open-hint' }, '查看商店说明 →'),
  ]);
}

function atlantaStatusBanner() {
  if (!state.atlantaData?.metadata?.stale) return null;
  const failed = state.atlantaData.metadata.failedStores
    .map(id => ATLANTA_STORES.find(store => store.id === id)?.name || id)
    .join('、');
  return el('div', { class: 'status-banner' }, `以下美国来源今天未能刷新：${failed || '未知来源'}。页面仅为这些商店保留上次确认记录。`);
}

function atlantaOfferCard(offer) {
  return offerCard(offer);
}

function atlantaHomeView() {
  const location = activeLocation();
  const offers = atlantaOffers();
  const activeStoreCount = new Set(offers.map(offer => offer.storeId)).size;
  const directCount = offers.filter(offer => offer.sourceLocation?.status === 'direct').length;
  const highlights = [...offers].filter(offer => offer.status !== 'unconfirmed').sort((a, b) => a.price - b.price).slice(0, 8);
  return el('main', { class: 'content' }, [
    atlantaStatusBanner(),
    el('section', { class: 'hero atlanta-hero' }, [
      el('h2', {}, 'Atlanta Westside 本周打折商品'),
      el('p', {}, '直接在站内查看 30318 周边商店的商品、美元价格和有效期。以 10 km（约 6.2 英里）作为方便购物区，不保存私人住址。'),
      el('div', { class: 'hero-meta' }, [
        el('span', { class: 'hero-pill' }, `${offers.length} 项真实优惠`),
        el('span', { class: 'hero-pill' }, `${activeStoreCount} 家有商品数据`),
        el('span', { class: 'hero-pill' }, `${directCount} 项零售商直达`),
        el('span', { class: 'hero-pill' }, `${location.radiusLabel} 默认半径`),
      ]),
    ]),
    sectionTitle('本周低价先看', '价格来自当前周促销；不同规格之间不直接比较'),
    highlights.length ? el('div', { class: 'offer-list' }, highlights.map(atlantaOfferCard)) : el('div', { class: 'empty' }, '当前没有成功载入的 Atlanta 商品优惠。'),
    sectionTitle('按商店查看', '点击商店卡片，在站内查看该店打折商品'),
    el('div', { class: 'store-grid' }, ATLANTA_STORES.map(atlantaStoreCard)),
    el('p', { class: 'footer-note' }, state.atlantaData?.metadata?.disclaimerZh || '美国商品数据暂不可用。所有来源都不猜测促销单页码。'),
  ]);
}

function atlantaStoresView() {
  return el('main', { class: 'content' }, [
    sectionTitle('Atlanta Westside 商店', '默认显示 10 km 购物圈；实际驾车时间请用地图确认'),
    el('div', { class: 'store-grid' }, ATLANTA_STORES.map(atlantaStoreCard)),
  ]);
}

function atlantaStoreView(storeId) {
  const store = ATLANTA_STORES.find(item => item.id === storeId) || ATLANTA_STORES[0];
  const offers = atlantaOffers().filter(offer => offer.storeId === store.id);
  const categoryIds = orderedCategoryIds(offers);
  const flyer = state.atlantaData?.flyers?.find(item => item.storeId === store.id);
  return el('main', { class: 'content', style: `--store-color:${store.color}` }, [
    el('section', { class: 'store-hero' }, [
      el('h2', {}, store.name),
      el('p', {}, `${store.shortAddress} · ${store.distanceLabel}\n${store.descriptionZh}`),
      el('div', { class: 'store-links' }, [
        el('a', { href: store.mapUrl, target: '_blank', rel: 'noopener noreferrer' }, '地图导航 ↗'),
        el('a', { href: flyer?.url || store.flyerUrl, target: '_blank', rel: 'noopener noreferrer' }, '本周促销来源 ↗'),
        el('a', { href: store.website, target: '_blank', rel: 'noopener noreferrer' }, '商店官网 ↗'),
      ]),
    ]),
    sectionTitle(`${offers.length} 项站内优惠`, offers.length ? `${store.membership}；按食品与日用品类别查看` : '当前公开 feed 没有该商店的可解析商品，保留官方入口但不伪造数据'),
    offers.length ? el('div', { class: 'chip-row' }, categoryIds.map(id => {
      const label = ATLANTA_CATEGORY_LABELS[id] || ['🛒', id];
      return el('button', { class: 'chip', onClick: () => document.getElementById(`atlanta-${store.id}-${id}`)?.scrollIntoView({ block: 'start' }) }, `${label[0]} ${label[1]}`);
    })) : null,
    ...categoryIds.map(id => {
      const label = ATLANTA_CATEGORY_LABELS[id] || ['🛒', id];
      const items = offers.filter(offer => offer.categoryId === id).sort((a, b) => a.price - b.price);
      return el('section', { id: `atlanta-${store.id}-${id}`, class: 'group' }, [
        el('div', { class: 'group-head' }, [el('h3', {}, `${label[0]} ${label[1]}`), el('p', {}, `${items.length} 项；不同规格不直接比较`)]),
        el('div', { class: 'offer-list' }, items.map(atlantaOfferCard)),
      ]);
    }),
    offers.length ? null : el('div', { class: 'empty' }, '该商店目前没有可验证的结构化周促销商品。可以使用上方官方入口查看。'),
    el('p', { class: 'footer-note' }, state.atlantaData?.metadata?.disclaimerZh || ''),
  ]);
}

function statusBanner() {
  const metadata = activeData()?.metadata || {};
  if (metadata.mode !== 'demo' && !metadata.stale) return null;
  const failed = (metadata.failedStores || []).map(id => storeById(id)?.name || id).join('、');
  const text = metadata.mode === 'demo'
    ? '当前是可交互的首版演示数据。部署后，每日更新程序会从促销数据源替换为真实且仍有效的商品。'
    : `以下商店今天未能刷新：${failed || '未知来源'}。仅这些商店保留上次确认记录。`;
  return el('div', { class: 'status-banner' }, text);
}

function homeView() {
  const allOffers = currentOffers();
  const offers = filterOffersByStore(allOffers);
  const nowOffers = offers.filter(o => new Date(o.validFrom) <= now() && new Date(o.validUntil) >= now());
  const nextOffers = offers.filter(o => new Date(o.validFrom) > now());
  const changed = offers.filter(o => o.changeType === 'new' || o.changeType === 'price_drop').length;
  const expiring = nowOffers.filter(o => {
    const days = (new Date(o.validUntil) - now()) / 86400000;
    return days >= 0 && days <= 1.5;
  }).length;
  const hero = el('section', { class: 'hero' }, [
    el('h2', {}, 'Aarhus 全市促销，今天去哪家一眼就知道。'),
    el('p', {}, '同一连锁的促销只保留一份并覆盖其 Aarhus 分店，不为每个地址重复商品。本期和下期商品都放进对应分类，并分别计算最低价；实际库存以所选门店为准。'),
    el('div', { class: 'hero-meta' }, [
      el('span', { class: 'hero-pill' }, `${activeStores().filter(store => allOffers.some(offer => offer.storeId === store.id)).length} 个有促销数据的连锁`),
      el('span', { class: 'hero-pill' }, `${nowOffers.length} 项现在能买`),
      el('span', { class: 'hero-pill' }, `${nextOffers.length} 项下期开始`),
      el('span', { class: 'hero-pill' }, `${changed} 项新增或降价`),
      el('span', { class: 'hero-pill' }, `${expiring} 项即将到期`),
    ]),
  ]);

  const catTitle = sectionTitle('像口袋书一样翻类别', '每页一个大类；本期与下期同页展示，但分别计算最低价');
  const catGrid = el('div', { class: 'quick-grid' }, visibleCategories(offers).map(c => {
    const count = offers.filter(o => o.categoryId === c.id).length;
    return el('button', { class: 'quick-card', onClick: () => go('category', c.id) }, [
      el('span', { class: 'emoji' }, c.emoji),
      el('strong', {}, c.nameZh),
      el('span', {}, `${count} 项促销`),
    ]);
  }));

  return el('main', { class: 'content' }, [statusBanner(), hero, storeFilterBar(allOffers, '先选准备去的商店'), catTitle, catGrid, footerNote()]);
}

function sectionTitle(title, subtitle) {
  return el('div', { class: 'section-title' }, el('div', {}, [el('h2', {}, title), el('p', {}, subtitle)]));
}
function visibleCategories(offers = currentOffers()) {
  const ids = new Set(offers.map(o => o.categoryId));
  return activeCategories().filter(c => ids.has(c.id));
}

function categoriesView() {
  const allOffers = currentOffers();
  const offers = filterOffersByStore(allOffers);
  const cats = visibleCategories(offers);
  return el('main', { class: 'content' }, [
    sectionTitle('商品分类', '点击一类进入；手机上左右滑动逐件翻商品'),
    storeFilterBar(allOffers, '选择要比较的商店'),
    el('div', { class: 'quick-grid' }, cats.map(c => {
      const categoryOffers = offers.filter(o => o.categoryId === c.id);
      const stores = new Set(categoryOffers.map(o => o.storeId)).size;
      return el('button', { class: 'quick-card', onClick: () => go('category', c.id) }, [
        el('span', { class: 'emoji' }, c.emoji),
        el('strong', {}, c.nameZh),
        el('span', {}, `${categoryOffers.length} 项 · ${stores} 家商店`),
      ]);
    })),
  ]);
}

function categoryView(categoryId) {
  const cats = visibleCategories();
  const index = Math.max(0, cats.findIndex(c => c.id === categoryId));
  const category = cats[index] || cats[0];
  const allOffers = currentOffers().filter(o => o.categoryId === category.id);
  const offers = filterOffersByStore(allOffers);
  const groups = groupOffers(offers);
  if (isMobileReadingMode()) {
    return mobileCategoryReader(category, allOffers, groups);
  }
  const main = el('main', { class: 'content category-content', style: `--page-color:${category.color}` }, [
    el('section', { class: 'page-head' }, [
      el('div', { class: 'kicker' }, '商品分类'),
      el('h2', {}, `${category.emoji} ${category.nameZh}`),
      el('p', {}, category.descriptionZh),
      el('span', { class: 'page-counter' }, `第 ${index + 1} 类 / 共 ${cats.length} 类 · ${offers.length} 项${hasStoreFilters() ? `（${state.storeFilters.length} 家商店）` : ''}`),
    ]),
    storeFilterBar(allOffers),
    ...groups.map(([groupId, groupOffersList]) => renderGroup(groupId, groupOffersList)),
    pager(cats, index),
  ]);
  return main;
}

function mobileCategoryReader(category, allOffers, groups) {
  const pages = groups.flatMap(([groupId, groupOffersList]) => groupOffersList.map((offer, groupIndex) => ({
    groupId,
    groupIndex,
    groupCount: groupOffersList.length,
    offer,
  })));
  if (state.reader.categoryId !== category.id || state.reader.storeFilterKey !== storeFilterKey()) {
    state.reader = { categoryId: category.id, storeFilterKey: storeFilterKey(), index: 0 };
  }
  state.reader.index = Math.max(0, Math.min(state.reader.index, Math.max(0, pages.length - 1)));
  const current = pages[state.reader.index];
  const groupLabel = activeComparisonGroups()[current?.groupId] || { nameZh: '其他商品', noteZh: '逐件查看商品。' };
  const progress = pages.length ? ((state.reader.index + 1) / pages.length) * 100 : 0;
  const stack = el('div', { class: 'mobile-reader-stack', tabindex: '0', 'aria-label': `${category.nameZh}全部商品，纵向连续浏览` }, pages.map((page, pageIndex) =>
    el('section', {
      class: 'reader-page',
      'data-reader-index': pageIndex,
      'data-reader-group': page.groupId,
      'data-reader-group-index': page.groupIndex,
      'data-reader-group-count': page.groupCount,
      'aria-label': `第 ${pageIndex + 1} 件，共 ${pages.length} 件`,
    }, offerCard(page.offer))
  ));
  const main = el('main', { class: 'mobile-reader', style: `--page-color:${category.color}` }, [
    el('header', { class: 'mobile-reader-head' }, [
      el('div', { class: 'reader-category-line' }, [
        el('div', { class: 'reader-heading' }, [
          el('span', { class: 'reader-kicker' }, `${category.emoji} ${category.nameZh}`),
          mobileReaderGroupPicker(groups, current?.groupId, groupLabel.nameZh),
        ]),
        el('div', { class: 'reader-head-actions' }, [
          mobileReaderStoreFilter(allOffers),
          el('span', { class: 'reader-group-count' }, current ? `${current.groupIndex + 1}/${current.groupCount}` : '0/0'),
        ]),
      ]),
      el('div', { class: 'reader-progress', 'aria-hidden': 'true' }, el('span', { style: `width:${progress}%` })),
    ]),
    pages.length ? stack : el('div', { class: 'empty' }, '当前筛选条件下没有商品。'),
    el('footer', { class: 'mobile-reader-footer' }, [
      el('button', { class: 'reader-prev', type: 'button', disabled: state.reader.index === 0 ? '' : null, onClick: () => turnReaderPage(-1, pages.length) }, '← 上一件'),
      el('span', { class: 'reader-page-count' }, `${pages.length ? state.reader.index + 1 : 0} / ${pages.length}`),
      el('button', { class: 'reader-next', type: 'button', disabled: state.reader.index >= pages.length - 1 ? '' : null, onClick: () => turnReaderPage(1, pages.length) }, '下一件 →'),
    ]),
  ]);
  if (pages.length) {
    attachReaderScroll(stack);
    attachReaderSwipe(main, pages.length);
    attachReaderGroupPicker(main);
    requestAnimationFrame(() => scrollReaderToIndex(state.reader.index, false));
  }
  return main;
}

function mobileReaderGroupPicker(groups, currentGroupId, currentLabel) {
  let startIndex = 0;
  const labels = activeComparisonGroups();
  const options = groups.map(([groupId, offers]) => {
    const groupStart = startIndex;
    startIndex += offers.length;
    const active = groupId === currentGroupId;
    return el('button', {
      class: `reader-group-option${active ? ' active' : ''}`,
      type: 'button',
      'data-reader-group-jump': groupId,
      'aria-current': active ? 'true' : null,
      onClick: event => jumpReaderToGroup(groupStart, event.currentTarget),
    }, [
      el('span', {}, labels[groupId]?.nameZh || '其他商品'),
      el('small', {}, `${offers.length} 件`),
    ]);
  });
  return el('details', { class: 'reader-group-picker' }, [
    el('summary', { 'aria-label': `选择小类，当前为${currentLabel}` }, [
      el('h2', { class: 'reader-subcategory-title' }, currentLabel),
      el('span', { class: 'reader-picker-arrow', 'aria-hidden': 'true' }, '⌄'),
    ]),
    el('div', { class: 'reader-group-menu' }, [
      el('div', { class: 'reader-group-menu-title' }, `跳到小类 · 共 ${groups.length} 类`),
      ...options,
    ]),
  ]);
}

function jumpReaderToGroup(index, control) {
  if (state.readerTransitioning) return;
  state.reader.index = index;
  updateReaderStatus(index);
  scrollReaderToIndex(index, false);
  const picker = control?.closest('.reader-group-picker');
  picker?.removeAttribute('open');
  picker?.querySelector('summary')?.focus();
}

function attachReaderGroupPicker(main) {
  const picker = main.querySelector('.reader-group-picker');
  const storeFilter = main.querySelector('.reader-store-filter');
  picker?.addEventListener('toggle', () => {
    if (!picker.open) return;
    storeFilter?.removeAttribute('open');
    requestAnimationFrame(() => picker.querySelector('.reader-group-option.active')?.scrollIntoView({ block: 'nearest' }));
  });
  storeFilter?.addEventListener('toggle', () => {
    state.readerStoreFilterOpen = storeFilter.open;
    if (storeFilter.open) picker?.removeAttribute('open');
  });
}

function mobileReaderStoreFilter(offers) {
  const stores = activeStores().filter(store => offers.some(offer => offer.storeId === store.id));
  if (stores.length < 2) return null;
  return el('details', {
    class: 'reader-store-filter',
    open: state.readerStoreFilterOpen ? '' : null,
  }, [
    el('summary', {}, `商店：${hasStoreFilters() ? `已选 ${state.storeFilters.length} 家` : '全部商店'} ▾`),
    el('div', {
      class: 'chip-row store-filter-row',
      'data-store-filter-scroll-key': storeFilterScrollKey(),
    }, [
      el('button', {
        class: `chip${hasStoreFilters() ? '' : ' active'}`,
        type: 'button',
        'aria-pressed': String(!hasStoreFilters()),
        onClick: () => setStoreFilter(null),
      }, `全部 ${offers.length}`),
      ...stores.map(store => {
        const count = offers.filter(offer => offer.storeId === store.id).length;
        const selected = state.storeFilters.includes(store.id);
        return el('button', {
          class: `chip store-filter-chip${selected ? ' active' : ''}`,
          type: 'button',
          'aria-pressed': String(selected),
          style: `--store-color:${store.color}`,
          onClick: () => setStoreFilter(store.id),
        }, `${selected ? '✓ ' : ''}${store.name} ${count}`);
      }),
    ]),
  ]);
}

function turnReaderPage(direction, pageCount) {
  if (state.readerTransitioning) return;
  const next = Math.max(0, Math.min(state.reader.index + direction, pageCount - 1));
  if (next === state.reader.index) return;
  const stack = document.querySelector('.mobile-reader-stack');
  const currentPage = stack?.querySelector(`[data-reader-index="${state.reader.index}"]`);
  const nextPage = stack?.querySelector(`[data-reader-index="${next}"]`);
  const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!stack || !currentPage || !nextPage || reducedMotion) {
    state.reader.index = next;
    updateReaderStatus(next);
    scrollReaderToIndex(next, false);
    return;
  }

  state.readerTransitioning = true;
  stack.classList.add('reader-turning');
  currentPage.classList.add(direction > 0 ? 'reader-exit-left' : 'reader-exit-right');
  setTimeout(() => {
    if (!document.contains(stack)) {
      state.readerTransitioning = false;
      return;
    }
    state.reader.index = next;
    updateReaderStatus(next);
    scrollReaderToIndex(next, false);
    currentPage.classList.remove('reader-exit-left', 'reader-exit-right');
    nextPage.classList.add(direction > 0 ? 'reader-enter-right' : 'reader-enter-left');
    requestAnimationFrame(() => requestAnimationFrame(() => nextPage.classList.add('reader-enter-active')));
    setTimeout(() => {
      if (!document.contains(stack)) {
        state.readerTransitioning = false;
        return;
      }
      nextPage.classList.remove('reader-enter-right', 'reader-enter-left', 'reader-enter-active');
      stack.classList.remove('reader-turning');
      state.readerTransitioning = false;
    }, 160);
  }, 100);
}

function scrollReaderToIndex(index, smooth) {
  const stack = document.querySelector('.mobile-reader-stack');
  const target = stack?.querySelector(`[data-reader-index="${index}"]`);
  const first = stack?.querySelector('.reader-page');
  if (!stack || !target || !first) return;
  const top = target.offsetTop - first.offsetTop;
  stack.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
}

function updateReaderStatus(index) {
  const stack = document.querySelector('.mobile-reader-stack');
  const page = stack?.querySelector(`[data-reader-index="${index}"]`);
  if (!page) return;
  const pages = stack.querySelectorAll('.reader-page');
  const groupId = page.dataset.readerGroup;
  const groupIndex = Number(page.dataset.readerGroupIndex);
  const groupTotal = Number(page.dataset.readerGroupCount);
  const label = activeComparisonGroups()[groupId] || { nameZh: '其他商品', noteZh: '逐件查看商品。' };
  const title = document.querySelector('.reader-subcategory-title');
  const groupCount = document.querySelector('.reader-group-count');
  const pageCount = document.querySelector('.reader-page-count');
  const progress = document.querySelector('.reader-progress span');
  const previous = document.querySelector('.reader-prev');
  const next = document.querySelector('.reader-next');
  if (title) title.textContent = label.nameZh;
  document.querySelectorAll('.reader-group-option').forEach(option => {
    const active = option.dataset.readerGroupJump === groupId;
    option.classList.toggle('active', active);
    if (active) option.setAttribute('aria-current', 'true');
    else option.removeAttribute('aria-current');
  });
  if (groupCount) groupCount.textContent = `${groupIndex + 1}/${groupTotal}`;
  if (pageCount) pageCount.textContent = `${index + 1} / ${pages.length}`;
  if (progress) progress.style.width = `${((index + 1) / pages.length) * 100}%`;
  if (previous) previous.disabled = index === 0;
  if (next) next.disabled = index >= pages.length - 1;
}

function attachReaderScroll(stack) {
  let frame = null;
  stack.addEventListener('scroll', () => {
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      if (state.readerTransitioning) return;
      const rect = stack.getBoundingClientRect();
      const probe = document.elementFromPoint(rect.left + rect.width / 2, rect.top + Math.min(110, rect.height * .28));
      const page = probe?.closest('.reader-page');
      if (!page) return;
      const index = Number(page.dataset.readerIndex);
      if (!Number.isInteger(index) || index === state.reader.index) return;
      state.reader.index = index;
      updateReaderStatus(index);
    });
  }, { passive: true });
}

function attachReaderSwipe(node, pageCount) {
  node.addEventListener('touchstart', e => {
    state.touchStartX = e.changedTouches[0].clientX;
    state.touchStartY = e.changedTouches[0].clientY;
    state.touchStartedInControl = Boolean(e.target.closest('button, a, input, select, textarea, summary, dialog, .chip-row'));
  }, { passive: true });
  node.addEventListener('touchend', e => {
    if (state.touchStartX === null || state.touchStartY === null) return;
    const delta = e.changedTouches[0].clientX - state.touchStartX;
    const verticalDelta = e.changedTouches[0].clientY - state.touchStartY;
    const startedInControl = state.touchStartedInControl;
    state.touchStartX = null;
    state.touchStartY = null;
    state.touchStartedInControl = false;
    if (startedInControl || Math.abs(delta) < 58 || Math.abs(delta) < Math.abs(verticalDelta) * 1.35) return;
    state.suppressReaderClickUntil = Date.now() + 500;
    turnReaderPage(delta < 0 ? 1 : -1, pageCount);
  }, { passive: true });
}

function pager(cats, index) {
  return el('div', { class: 'pager' }, [
    el('button', { class: 'nav-btn', disabled: index === 0 ? '' : null, onClick: () => index > 0 && go('category', cats[index - 1].id) }, '← 上一类'),
    el('div', { class: 'pager-count' }, `${index + 1} / ${cats.length}`),
    el('button', { class: 'nav-btn next', disabled: index >= cats.length - 1 ? '' : null, onClick: () => index < cats.length - 1 && go('category', cats[index + 1].id) }, '下一类 →'),
  ]);
}

function groupOffers(offers) {
  const map = new Map();
  offers.forEach(o => {
    const key = o.comparisonGroup || 'other';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(o);
  });
  return [...map.entries()].map(([key, values]) => [key, values.sort(compareOffers)]).sort((a,b) => {
    const av = comparableSortValue(a[1][0]);
    const bv = comparableSortValue(b[1][0]);
    return av - bv;
  });
}
function comparableSortValue(offer) {
  return Number.isFinite(offer?.unitPriceValue) && /(?:\/kg|\/L)$/.test(String(offer?.unitPriceUnit || ''))
    ? offer.unitPriceValue
    : Infinity;
}
function compareOffers(a,b) {
  const au = comparableSortValue(a);
  const bu = comparableSortValue(b);
  if (au !== bu) return au - bu;
  return (a.price ?? Infinity) - (b.price ?? Infinity);
}
function renderGroup(groupId, offers) {
  const groups = activeComparisonGroups();
  const label = groups[groupId] || groups.other || { nameZh: '其他商品', noteZh: '这些商品的规格不一定完全相同。' };
  return el('section', { class: 'group', id: `group-${groupId}` }, [
    el('div', { class: 'group-head' }, [
      el('div', {}, [el('h3', {}, label.nameZh), el('p', {}, label.noteZh)]),
      el('span', { class: 'group-count' }, `${offers.length} 项`),
    ]),
    el('div', { class: 'offer-list' }, offers.map(o => offerCard(o))),
  ]);
}

function shoppingControls(o, listView = false) {
  const entry = shoppingEntry(o);
  if (listView) {
    const quantity = shoppingQuantity(o);
    const subtotal = Number.isFinite(o.price)
      ? (o.currency === 'USD' ? usd(o.price * quantity) : money(o.price * quantity))
      : '价格待确认';
    return el('div', { class: 'shopping-list-controls' }, [
      el('div', { class: 'shopping-quantity-row' }, [
        el('span', { class: 'shopping-quantity-label' }, '购买数量'),
        el('div', { class: 'shopping-stepper', role: 'group', 'aria-label': `${o.productNameZh || o.originalName}购买数量` }, [
          el('button', {
            type: 'button',
            disabled: quantity === 0 ? '' : null,
            'data-quantity-action': 'decrease',
            'aria-label': `减少${o.productNameZh || o.originalName}数量`,
            onClick: () => updateShoppingQuantity(o, -1),
          }, '−'),
          el('output', { 'data-quantity-value': '', 'aria-live': 'polite', 'aria-label': '当前数量' }, quantity),
          el('button', {
            type: 'button',
            'aria-label': `增加${o.productNameZh || o.originalName}数量`,
            onClick: () => updateShoppingQuantity(o, 1),
          }, '+'),
        ]),
        el('strong', { class: 'shopping-line-total' }, `本项 ${subtotal}`),
      ]),
      el('div', { class: 'shopping-actions' }, [
        el('button', {
          class: 'shopping-btn primary',
          type: 'button',
          onClick: () => setShoppingStatus(o, entry?.status === 'done' ? 'wanted' : 'done'),
        }, entry?.status === 'done' ? '↺ 还要买' : '✓ 标记已买到'),
        el('button', { class: 'shopping-btn', type: 'button', onClick: () => setShoppingStatus(o, null) }, '移出清单'),
      ]),
    ]);
  }
  const label = entry?.status === 'done'
    ? '✓ 已买到 · 点击恢复'
    : entry?.status === 'wanted'
      ? '✓ 已加入清单 · 查看清单'
      : '＋ 加入购物清单';
  return el('button', {
    class: `shopping-toggle${entry ? ' selected' : ''}${entry?.status === 'done' ? ' done' : ''}`,
    type: 'button',
    'aria-pressed': entry ? 'true' : 'false',
    onClick: () => entry?.status === 'wanted' ? go('shopping') : setShoppingStatus(o, 'wanted'),
  }, label);
}

function offerCard(o, options = {}) {
  const store = storeById(o.storeId);
  const entry = shoppingEntry(o);
  const comparison = globalPriceComparison(o);
  const best = comparison?.isBest ? comparison : null;
  const badges = [
    el('span', { class: 'badge store', style: `--store-color:${store?.color || '#315f51'}` }, store?.name || o.storeId),
  ];
  if (o.memberOnly) badges.push(el('span', { class: 'badge warning' }, '会员价'));
  if (o.multiBuy) badges.push(el('span', { class: 'badge warning' }, o.multiBuy));
  if (o.changeType === 'new') badges.push(el('span', { class: 'badge' }, '新增'));
  if (o.changeType === 'price_drop') badges.push(el('span', { class: 'badge' }, `降价 ${o.priceDropAmount || ''}`.trim()));
  if (o.status === 'unconfirmed') badges.push(el('span', { class: 'badge warning' }, '等待重新确认'));
  if (best?.ties > 1) badges.push(el('span', { class: 'badge best-tie' }, `${best.ties} 项并列最低`));
  if (entry?.status === 'wanted') badges.push(el('span', { class: 'badge selected-badge' }, '购物清单中'));
  if (entry?.status === 'done') badges.push(el('span', { class: 'badge done-badge' }, '已买到'));
  return el('article', {
    class: `offer-card${best ? ' best' : ''}${best?.futureBetter ? ' future-best' : ''}${entry?.status === 'wanted' ? ' selected-offer' : ''}${entry?.status === 'done' ? ' completed-offer' : ''}`,
    'data-best-label': best?.label || null,
    'data-shopping-key': entry ? shoppingOfferKey(o) : null,
  }, [
    o.imageUrl ? el('img', { class: 'offer-image', src: o.imageUrl, alt: o.originalName, loading: 'lazy', referrerpolicy: 'no-referrer' }) : null,
    offerTitle(o),
    el('p', { class: 'zh-explanation' }, o.zhExplanation),
    el('div', { class: 'price-row' }, [el('span', { class: 'price' }, offerMoney(o)), el('span', { class: 'package' }, o.packageText || (o.currency === 'USD' ? '促销单标示价格' : '规格待确认'))]),
    o.unitPriceDisplay ? el('div', { class: 'unit-price' }, `单位价格：${o.unitPriceDisplay}`) : null,
    comparison ? el('div', { class: `price-gap${comparison.isBest ? ' best-gap' : ''}${comparison.futureBetter ? ' future-gap' : ''}` }, [
      el('span', {}, priceGapText(o, comparison)),
      el('button', {
        class: 'view-lowest-btn',
        type: 'button',
        onClick: () => openLowestModal(comparison),
      }, comparison.bestOffers.length > 1 ? `查看 ${comparison.bestOffers.length} 个最低商品` : '查看最低商品'),
    ]) : null,
    el('div', { class: 'badges' }, [el('span', { class: `badge ${new Date(o.validFrom) > now() ? 'warning' : ''}` }, availabilityBadge(o)), ...badges]),
    shoppingControls(o, options.listView),
    offerDetails(o, store),
  ]);
}

function offerDetails(o, store) {
  const desktop = !isMobileReadingMode();
  return el('details', { class: 'offer-details', open: desktop ? '' : null }, [
    el('summary', {}, [
      el('span', {}, `${formatDate(o.validFrom)}—${formatDate(o.validUntil)} · 门店与来源`),
      el('span', { class: 'details-action' }, '展开'),
    ]),
    el('div', { class: 'meta-grid' }, [
      el('div', { class: 'meta-line' }, [el('span', {}, '优惠期限'), el('strong', {}, `${formatDate(o.validFrom)}—${formatDate(o.validUntil)}`)]),
      el('div', { class: 'meta-line store-location-line' }, [el('span', {}, '附近门店'), nearbyStoreControl(store)]),
      el('div', { class: 'meta-line' }, [el('span', {}, '最后确认'), el('strong', {}, formatDate(o.lastSeenAt))]),
    ]),
    renderSourceLocation(o, store),
  ]);
}


function renderSourceLocation(o, store) {
  const loc = o.sourceLocation || {};
  const href = loc.deepLink || o.sourceUrl || store?.flyerUrl || null;
  const verified = loc.status === 'verified' && Number.isInteger(loc.pageNumber);
  const direct = loc.status === 'direct' && href;
  if (verified) {
    const position = loc.positionLabel ? `，${loc.positionLabel}` : '';
    return el('div', { class: 'source-block verified' }, [
      el('div', { class: 'source-heading' }, [el('strong', {}, '促销单准确定位'), el('span', { class: 'source-status' }, '已核验')]),
      el('p', {}, `数据源明确标注第 ${loc.pageNumber} 页${position}。按商品原名“${o.originalName}”核对。`),
      href ? el('a', { class: 'source-link', href, target: '_blank', rel: 'noopener noreferrer' }, `打开促销单并查看第 ${loc.pageNumber} 页 ↗`) : null,
    ]);
  }
  if (direct) {
    return el('div', { class: 'source-block direct' }, [
      el('div', { class: 'source-heading' }, [el('strong', {}, '商品优惠入口'), el('span', { class: 'source-status' }, '直达链接')]),
      el('p', {}, '该来源提供商品级链接，但不提供可靠页码。'),
      el('a', { class: 'source-link', href, target: '_blank', rel: 'noopener noreferrer' }, '打开商品优惠 ↗'),
    ]);
  }
  if (href) {
    return el('div', { class: 'source-block unlocated' }, [
      el('div', { class: 'source-heading' }, [el('strong', {}, '来源'), el('span', { class: 'source-status' }, '尚未定位')]),
      el('p', {}, `当前只能确认整本促销单，尚未核验页码。请按商品原名“${o.originalName}”查找。`),
      el('a', { class: 'source-link secondary', href, target: '_blank', rel: 'noopener noreferrer' }, '打开该商店促销单 ↗'),
    ]);
  }
  return null;
}

function storesView() {
  const offers = currentOffers();
  return el('main', { class: 'content' }, [
    sectionTitle('按商店查看', '每家店有独立颜色、附近地址、会员提示和内部分类'),
    el('div', { class: 'store-grid' }, activeStores().map(store => {
      const storeOffers = offers.filter(o => o.storeId === store.id);
      const comparable = storeOffers.filter(o => Number.isFinite(o.unitPriceValue));
      const cheapest = [...(comparable.length ? comparable : storeOffers)].sort(compareOffers)[0];
      return el('button', { class: 'store-card', style: `--store-color:${store.color}`, onClick: () => go('store', store.id) }, [
        el('h3', {}, store.name),
        el('p', {}, `${store.shortAddress} · ${store.distanceLabel}`),
        el('div', { class: 'store-stats' }, [
          el('span', { class: 'store-stat' }, `${storeOffers.length} 项优惠`),
          el('span', { class: 'store-stat' }, store.membership),
          cheapest ? el('span', { class: 'store-stat' }, `低价示例 ${offerMoney(cheapest)}`) : null,
        ]),
      ]);
    })),
  ]);
}

function storeView(storeId) {
  const store = storeById(storeId) || activeStores()[0];
  const offers = currentOffers().filter(o => o.storeId === store.id);
  const categoryIds = orderedCategoryIds(offers);
  const selectedCategoryId = categoryIds.includes(state.storeCategoryByStore[store.id])
    ? state.storeCategoryByStore[store.id]
    : categoryIds[0];
  if (selectedCategoryId) state.storeCategoryByStore[store.id] = selectedCategoryId;
  const catChips = el('div', { class: 'chip-row store-category-chips' }, categoryIds.map(id => {
    const c = categoryById(id);
    const active = id === selectedCategoryId;
    return el('button', {
      class: `chip${active ? ' active' : ''}`,
      type: 'button',
      'aria-pressed': String(active),
      onClick: () => selectStoreCategory(store.id, id),
    }, `${c?.emoji || '🛒'} ${c?.nameZh || id}`);
  }));
  const categoryNavigation = offers.length ? el('aside', {
    class: 'store-category-float',
    'aria-label': '切换当前商店的大类',
    'aria-hidden': 'true',
  }, [
    el('div', { class: 'store-category-float-head' }, [
      el('div', {}, [el('strong', {}, '切换大类'), el('span', {}, `${store.name} · ${categoryIds.length} 类`)]),
      el('button', { type: 'button', 'aria-label': '收起大类选择', onClick: () => setStoreCategoryNavigation(false) }, '×'),
    ]),
    el('div', { class: 'store-category-options' }, categoryIds.map(id => {
      const category = categoryById(id);
      const count = offers.filter(offer => offer.categoryId === id).length;
      return el('button', {
        class: `store-category-option${id === selectedCategoryId ? ' active' : ''}`,
        type: 'button',
        'data-category-id': id,
        onClick: () => selectStoreCategory(store.id, id),
      }, [
        el('span', {}, `${category?.emoji || '🛒'} ${category?.nameZh || id}`),
        el('small', {}, `${count} 项`),
      ]);
    })),
    el('p', { class: 'store-category-float-hint' }, '选择后自动定位；轻点页面中央也可收起'),
  ]) : null;
  const selectedFlyer = !isAarhusLocation() ? state.atlantaData?.flyers?.find(flyer => flyer.storeId === store.id) : null;
  return el('main', { class: 'content', style: `--store-color:${store.color}` }, [
    el('section', { class: 'store-hero' }, [
      el('h2', {}, store.name),
      el('p', {}, `${store.shortAddress} · ${store.distanceLabel}\n${store.descriptionZh}`),
      el('div', { class: 'store-links' }, [
        el('a', { href: store.mapUrl, target: '_blank', rel: 'noopener noreferrer' }, '地图导航 ↗'),
        el('a', { href: selectedFlyer?.url || store.flyerUrl, target: '_blank', rel: 'noopener noreferrer' }, '本周促销单 ↗'),
        el('a', { href: store.website, target: '_blank', rel: 'noopener noreferrer' }, '商店官网 ↗'),
      ]),
    ]),
    sectionTitle(`${offers.length} 项当前促销`, `${store.membership}；每次只显示一个大类，减少手机卡顿`),
    offers.length ? catChips : null,
    ...categoryIds.filter(id => id === selectedCategoryId).map(id => {
      const c = categoryById(id);
      const list = offers.filter(o => o.categoryId === id);
      return el('section', { id: `store-${store.id}-${id}`, class: 'group store-category-section', 'data-category-id': id }, [
        el('div', { class: 'group-head' }, [el('h3', {}, `${c?.emoji || ''} ${c?.nameZh || id}`), el('p', {}, `${list.length} 项`)]),
        ...groupOffers(list).map(([gid, group]) => renderGroup(gid, group)),
      ]);
    }),
    categoryNavigation,
    offers.length ? null : el('div', { class: 'empty' }, '该商店目前没有可验证的结构化周促销商品。可以使用上方官方入口查看。'),
  ]);
}

function searchView() {
  const all = currentOffers();
  const query = state.search.trim().toLowerCase();
  const scoredResults = !query ? [] : all.map(offer => ({
    offer,
    score: offerSearchScore(offer, query, {
      storeName: storeById(offer.storeId)?.name,
      comparisonGroupName: activeComparisonGroups()?.[offer.comparisonGroup]?.nameZh,
    }),
  })).filter(result => result.score > 0);
  const scoreByKey = new Map(scoredResults.map(result => [result.offer.canonicalKey, result.score]));
  const allResults = scoredResults.map(result => result.offer);
  const results = filterOffersByStore(allResults);
  const input = el('input', { class: 'search-input', value: state.search, placeholder: '输入商品名后按回车搜索……', type: 'search', enterKeyHint: 'search' });
  input.addEventListener('input', e => {
    state.search = e.target.value;
    const p = new URLSearchParams({ view: 'search' });
    if (state.search) p.set('q', state.search);
    if (hasStoreFilters()) p.set('stores', storeFilterKey());
    history.replaceState(null, '', `#${p}`);
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') render(); });
  return el('main', { class: 'content' }, [
    el('div', { class: 'search-panel' }, [input, el('p', { class: 'search-hint' }, '同时搜索商品原名、中文解释、商店名称。中文解释不会折叠。')]),
    query ? storeFilterBar(allResults) : null,
    query ? sectionTitle(`找到 ${results.length} 项`, hasStoreFilters() ? `最低价与差价按已选 ${state.storeFilters.length} 家商店计算` : '最低价与差价按全部商店计算') : sectionTitle('搜索商品', '例如鸡腿肉、kylling、chicken、Coca-Cola Zero'),
    query ? el('div', { class: 'offer-list' }, [...results].sort((a, b) => (
      (scoreByKey.get(b.canonicalKey) || 0) - (scoreByKey.get(a.canonicalKey) || 0)
      || compareOffers(a, b)
    )).map(o => offerCard(o))) : el('div', { class: 'empty' }, '输入商品名称后显示结果。'),
    el('aside', { class: 'github-star-card', 'aria-label': '支持买菜口袋书项目' }, [
      el('div', { class: 'github-star-copy' }, [
        el('span', { class: 'github-star-icon', 'aria-hidden': 'true' }, '⭐'),
        el('div', {}, [
          el('strong', {}, '觉得这个买菜口袋书好用？'),
          el('p', {}, '欢迎去 GitHub 看看项目，也可以顺手帮我点个 Star。'),
        ]),
      ]),
      el('div', { class: 'github-star-action' }, [
        el('a', {
          class: 'github-star-link',
          href: 'https://github.com/isSiYua/aarhus-grocery-deals',
          target: '_blank',
          rel: 'noopener noreferrer',
          'aria-label': '在 GitHub 打开 aarhus-grocery-deals 仓库并点 Star',
        }, '打开 GitHub · Star ⭐'),
        el('p', {}, '求求你了，给我点个 star 吧'),
      ]),
    ]),
    footerNote(),
  ]);
}

function shoppingListView() {
  const entries = locationShopping();
  const allOffers = currentOffers().filter(offer => entries[shoppingOfferKey(offer)]);
  const visibleOffers = filterOffersByStore(allOffers);
  const allWanted = allOffers.filter(offer => entries[shoppingOfferKey(offer)]?.status === 'wanted');
  const allCompleted = allOffers.filter(offer => entries[shoppingOfferKey(offer)]?.status === 'done');
  const wanted = visibleOffers.filter(offer => entries[shoppingOfferKey(offer)]?.status === 'wanted');
  const completed = visibleOffers.filter(offer => entries[shoppingOfferKey(offer)]?.status === 'done');
  const total = shoppingTotal(allWanted);
  const visibleTotal = shoppingTotal(wanted);
  const availableKeys = new Set(allOffers.map(shoppingOfferKey));
  const unavailableCount = Object.keys(entries).filter(key => !availableKeys.has(key)).length;

  const renderByStore = offers => activeStores().flatMap(store => {
    const storeOffers = offers.filter(offer => offer.storeId === store.id).sort(compareOffers);
    if (!storeOffers.length) return [];
    return [el('section', { class: 'shopping-store-section', style: `--store-color:${store.color}` }, [
      el('div', { class: 'shopping-store-head' }, [
        el('div', {}, [el('h3', {}, store.name), el('p', {}, `${store.shortAddress} · ${storeOffers.length} 项`)]),
        el('button', { class: 'chip', onClick: () => go('store', store.id) }, '查看该店'),
      ]),
      el('div', { class: 'offer-list' }, storeOffers.map(offer => offerCard(offer, { listView: true }))),
    ])];
  });

  const completedSection = completed.length ? el('details', {
    class: 'completed-list',
    open: state.completedListOpen ? '' : null,
    onToggle: event => { state.completedListOpen = event.currentTarget.open; },
  }, [
    el('summary', {}, `已买到 ${completed.length} 项 · 点击展开或恢复`),
    el('p', { class: 'completed-help' }, '已买到的商品不会删除，只会置灰并收在这里；需要再买时点“还要买”。'),
    ...renderByStore(completed),
  ]) : null;

  return el('main', { class: 'content shopping-view' }, [
    el('section', { class: 'hero shopping-hero' }, [
      el('h2', {}, '我的购物清单'),
      el('p', {}, '先按商店规划路线，再调整数量、逐项打勾。数量减到 0 仍会留在清单中，只有“移出清单”才会删除。'),
      el('div', { class: 'hero-meta' }, [
        el('span', { class: 'hero-pill' }, `${allWanted.length} 项待购买`),
        el('span', { class: 'hero-pill' }, `${allCompleted.length} 项已买到`),
      ]),
    ]),
    el('div', { class: 'shopping-total', 'aria-live': 'polite' }, [
      el('div', { class: 'shopping-total-copy' }, [
        el('span', {}, '当前已选合计'),
        el('small', { class: 'shopping-total-summary' }, [
          `${allWanted.length} 项商品 · 合计 ${total.quantity} 份`,
          total.missingCount ? ` · ${total.missingCount} 项价格待确认` : '',
        ]),
      ]),
      el('strong', { class: 'shopping-total-value', 'aria-label': total.display }, [
        el('span', { class: 'shopping-total-number' }, total.amount),
        total.currency === 'DKK' ? el('span', { class: 'shopping-total-unit' }, 'DKK') : null,
      ]),
      hasStoreFilters() ? el('em', { class: 'shopping-total-filtered' }, `已选 ${state.storeFilters.length} 家商店 · ${wanted.length} 项 / ${visibleTotal.quantity} 份 · ${visibleTotal.display}`) : null,
    ]),
    storeFilterBar(allOffers, '只看准备去的商店'),
    unavailableCount > 0 ? el('div', { class: 'status-banner' }, `${unavailableCount} 项旧优惠已不在本期数据中，暂不显示；不会影响当前清单。`) : null,
    sectionTitle(`${wanted.length} 项待购买`, wanted.length ? `已按商店分组；最低价按${hasStoreFilters() ? '当前所选商店' : '全部商店'}计算` : '浏览商品时点击“加入购物清单”'),
    ...(wanted.length ? renderByStore(wanted) : [el('div', { class: 'empty' }, '清单还是空的。去分类、商店或搜索页面选择想买的商品吧。')]),
    completedSection,
  ]);
}

function footerNote() {
  const defaultText = '促销通常是连锁店级别，附近门店库存可能不同。单位价格只在规格可可靠换算时参与同类排序；会员价、多件价和限购条件会明确标注。';
  return el('aside', { class: 'public-trust-note', 'aria-label': '公开使用与安全说明' }, [
    el('div', { class: 'trust-note-header' }, [
      el('span', { class: 'trust-note-mark', 'aria-hidden': 'true' }, '✓'),
      el('span', { class: 'trust-note-heading' }, [
        el('strong', {}, '所有功能永久免费'),
        el('small', {}, '无广告 · 无会员 · 非官方促销工具'),
      ]),
    ]),
    el('div', { class: 'trust-note-body' }, [
      el('p', {}, '网站不售卖商品，也不设置会员或付费功能。任何以“买菜口袋书”或作者名义私信索要转账、银行卡或验证码的行为都不是本站行为。'),
      el('p', {}, '本站不代表任何超市、Tjek 或 eTilbudsavis。'),
      el('p', {}, activeData()?.metadata?.disclaimerZh || defaultText),
      el('p', {}, '价格、库存、会员条件和促销有效期最终以门店及原促销单为准。定位只在你的设备本地计算，购物清单只保存在当前浏览器。'),
      el('a', {
        href: 'https://github.com/isSiYua/aarhus-grocery-deals/security/policy',
        target: '_blank',
        rel: 'noopener noreferrer',
      }, '查看官方安全与反冒用说明 ↗'),
    ]),
  ]);
}

function render({ preserveScroll = false } = {}) {
  const scrollY = window.scrollY;
  const root = document.getElementById('app');
  captureStoreFilterScroll(root);
  root.classList.toggle('mobile-reading-mode', isMobileReadingMode());
  // Keep chrome (topbar + bottom-nav) always visible on listing/search/home views;
  // only the category reader uses hidden chrome for immersive swiping.
  if (state.route.view !== 'category') {
    state.chrome = { topHidden: false, bottomHidden: false };
  }
  root.replaceChildren();
  if (state.route.view !== 'shopping') root.append(topbar());
  let view;
  if (state.route.view === 'locations') view = locationsView();
  else if (state.route.view === 'categories') view = categoriesView();
  else if (state.route.view === 'category') view = categoryView(state.route.id);
  else if (state.route.view === 'stores') view = storesView();
  else if (state.route.view === 'store') view = storeView(state.route.id);
  else if (state.route.view === 'shopping') view = shoppingListView();
  else if (state.route.view === 'search') view = searchView();
  else view = homeView();
  root.append(view, bottomNav());
  restoreStoreFilterScroll(root);
  attachReadingChromeTap(view);
  window.scrollTo({ top: preserveScroll ? scrollY : 0, behavior: 'auto' });
  requestAnimationFrame(() => {
    restoreStoreFilterScroll(root);
    syncChromeLayout();
  });
}

async function boot() {
  try {
    if (globalThis.__GROCERY_DATA__) {
      state.data = globalThis.__GROCERY_DATA__;
      state.atlantaData = ATLANTA_EASTER_EGG_ENABLED
        ? (globalThis.__ATLANTA_DATA__ || { metadata: { stale: true, failedStores: [] }, offers: [], flyers: [] })
        : null;
    } else {
      const aarhusRes = await fetch('data/current_offers.json', { cache: 'no-store' });
      if (!aarhusRes.ok) throw new Error(`Aarhus data HTTP ${aarhusRes.status}`);
      state.data = await aarhusRes.json();
      if (ATLANTA_EASTER_EGG_ENABLED) {
        const atlantaRes = await fetch('data/atlanta_offers.json', { cache: 'no-store' });
        state.atlantaData = atlantaRes.ok
          ? await atlantaRes.json()
          : { metadata: { stale: true, failedStores: [] }, offers: [], flyers: [] };
      } else {
        state.atlantaData = null;
      }
    }
    const savedLocation = localStorage.getItem(LOCATION_KEY);
    state.locationId = LOCATIONS.some(location => location.id === savedLocation) ? savedLocation : LOCATIONS[0].id;
    try {
      const savedShopping = JSON.parse(localStorage.getItem(SHOPPING_KEY) || '{}');
      state.shopping = savedShopping && typeof savedShopping === 'object' && !Array.isArray(savedShopping) ? savedShopping : {};
    } catch {
      state.shopping = {};
    }
    const mobileReadingMode = isMobileReadingMode();
    state.chrome = { topHidden: mobileReadingMode, bottomHidden: mobileReadingMode };
    parseRoute();
    render();
  } catch (error) {
    document.getElementById('app').replaceChildren(el('main', { class: 'content' }, [
      el('div', { class: 'empty' }, [el('strong', {}, '数据加载失败'), el('br'), String(error)]),
    ]));
  }
  if (!globalThis.__GROCERY_DATA__ && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
    registerServiceWorker().catch(() => {});
  }
}

let workerReloading = false;
let lastResumeRefreshAt = 0;

async function registerServiceWorker() {
  const hadController = Boolean(navigator.serviceWorker.controller);
  const registration = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
  state.serviceWorkerRegistration = registration;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || workerReloading) return;
    workerReloading = true;
    location.reload();
  });
  await registration.update();
}

async function refreshAfterResume() {
  if (document.visibilityState !== 'visible' || globalThis.__GROCERY_DATA__) return;
  const currentTime = Date.now();
  if (currentTime - lastResumeRefreshAt < 120_000) return;
  lastResumeRefreshAt = currentTime;
  state.serviceWorkerRegistration?.update().catch(() => {});
  if (state.data) await refreshActiveData();
}

document.addEventListener('visibilitychange', refreshAfterResume);
window.addEventListener('focus', refreshAfterResume);
window.addEventListener('hashchange', () => { parseRoute(); render(); });
window.addEventListener('resize', syncChromeLayout, { passive: true });
boot();
