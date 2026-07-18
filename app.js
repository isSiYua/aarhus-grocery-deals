const state = {
  data: null,
  atlantaData: null,
  route: { view: 'home', id: null },
  search: '',
  touchStartX: null,
  locationId: null,
};

const LOCATION_KEY = 'grocery-deals-location-v1';
const LOCATIONS = [
  {
    id: 'aarhus-v',
    label: 'Aarhus V',
    radiusLabel: '10 km',
    mode: 'items',
    descriptionZh: '丹麦商品级促销：每天更新、按品类比较，并保留来源定位状态。',
  },
  {
    id: 'atlanta-westside',
    label: 'Atlanta Westside',
    radiusLabel: '10 km',
    mode: 'items',
    descriptionZh: '美国商品级周促销：站内查看商品、美元价格、有效期和可追溯来源。',
  },
];

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
  produce: ['🥬', '蔬菜水果'],
  meat: ['🥩', '肉类熟食'],
  seafood: ['🐟', '鱼类海鲜'],
  dairy: ['🥛', '乳制品鸡蛋'],
  bakery: ['🍞', '面包烘焙'],
  frozen: ['🧊', '冷冻食品'],
  pantry: ['🥫', '主食调味'],
  snacks: ['🍪', '零食甜品'],
  drinks: ['🥤', '饮料'],
  baby: ['🍼', '婴幼儿用品'],
  household: ['🧻', '家庭日用品'],
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
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value !== null && value !== undefined) node.setAttribute(key, value);
  });
  (Array.isArray(children) ? children : [children]).forEach(child => {
    if (child === null || child === undefined) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return node;
};

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
const currentOffers = () => (activeData()?.offers || []).filter(o => !['expired', 'withdrawn'].includes(o.status));
const atlantaOffers = () => (state.atlantaData?.offers || []).filter(o => o.status !== 'expired');
const purchasableNow = () => currentOffers().filter(o => new Date(o.validFrom) <= now() && new Date(o.validUntil) >= now());
const upcomingOffers = () => currentOffers().filter(o => new Date(o.validFrom) > now());
const firstSentence = text => String(text || '').split(/(?<=[。！？])/)[0] || '查看中文说明';
const availabilityBadge = o => new Date(o.validFrom) > now() ? `下期开始 ${formatDate(o.validFrom)}` : '现在能买';
const storeById = id => activeStores().find(s => s.id === id);
const categoryById = id => activeCategories().find(c => c.id === id);
const offerMoney = offer => offer.currency === 'USD' ? usd(offer.price) : money(offer.price);

async function copyOfferName(name, button) {
  const resetLabel = '复制';
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(name);
    } else {
      const input = el('textarea', { 'aria-hidden': 'true' }, name);
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.append(input);
      input.select();
      if (!document.execCommand('copy')) throw new Error('Copy command failed');
      input.remove();
    }
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

function offerTitle(name) {
  const copyButton = el('button', {
    class: 'copy-name-btn',
    type: 'button',
    title: '复制商品原名',
    'aria-label': `复制商品原名：${name}`,
  }, '复制');
  copyButton.addEventListener('click', () => copyOfferName(name, copyButton));
  return el('div', { class: 'offer-title-row' }, [el('h4', {}, name), copyButton]);
}

function parseRoute() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  state.route.view = params.get('view') || 'home';
  state.route.id = params.get('id');
  state.search = params.get('q') || '';
}
function go(view, id = null, extra = {}) {
  const p = new URLSearchParams({ view });
  if (id) p.set('id', id);
  Object.entries(extra).forEach(([k, v]) => v && p.set(k, v));
  location.hash = p.toString();
}

function topbar() {
  const location = activeLocation();
  return el('header', { class: 'topbar' }, el('div', { class: 'topbar-row' }, [
    el('div', { class: 'brand' }, [
      el('div', { class: 'brand-mark' }, '菜'),
      el('div', {}, [
        el('h1', {}, '买菜口袋书'),
        el('p', {}, `${location.label} · 更新于 ${formatUpdated(activeData()?.metadata?.updatedAt || new Date().toISOString())}`),
      ]),
    ]),
    el('div', { class: 'topbar-actions' }, [
      el('button', { class: 'icon-btn', 'aria-label': '切换地点', onClick: () => go('locations') }, '◎'),
      el('button', { class: 'icon-btn', 'aria-label': '搜索', onClick: () => go('search') }, '⌕'),
    ]),
  ]));
}

function bottomNav() {
  const items = [
    ['home', '⌂', '首页'],
    ['categories', '▤', '分类'],
    ['stores', '⌖', '商店'],
    ['search', '⌕', '搜索'],
  ];
  return el('nav', { class: 'bottom-nav', 'aria-label': '主导航' }, items.map(([view, icon, label]) =>
    el('button', { class: state.route.view === view || (view === 'categories' && state.route.view === 'category') || (view === 'stores' && state.route.view === 'store') ? 'active' : '', onClick: () => go(view) }, [
      el('span', {}, icon), label,
    ])
  ));
}

function locationCard(location) {
  const selected = location.id === state.locationId;
  return el('button', {
    class: `location-card${selected ? ' selected' : ''}`,
    onClick: () => {
      state.locationId = location.id;
      localStorage.setItem(LOCATION_KEY, location.id);
      go('home');
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
  const store = ATLANTA_STORES.find(item => item.id === offer.storeId);
  const category = ATLANTA_CATEGORY_LABELS[offer.categoryId] || ['🛒', '其他'];
  const direct = offer.sourceLocation?.status === 'direct' && offer.sourceLocation.deepLink;
  return el('article', { class: 'offer-card atlanta-offer-card' }, [
    offer.imageUrl ? el('img', { class: 'offer-image', src: offer.imageUrl, alt: offer.originalName, loading: 'lazy', referrerpolicy: 'no-referrer' }) : null,
    el('div', { class: 'badges atlanta-offer-badges' }, [
      el('span', { class: 'badge store', style: `--store-color:${store?.color || '#315f51'}` }, store?.name || offer.storeId),
      el('span', { class: 'badge' }, `${category[0]} ${category[1]}`),
      offer.status === 'unconfirmed' ? el('span', { class: 'badge warning' }, '等待重新确认') : null,
    ]),
    el('h4', {}, offer.originalName),
    el('p', { class: 'zh-explanation' }, `${offer.zhExplanation}${offer.brand ? ` 品牌：${offer.brand}。` : ''}`),
    el('div', { class: 'price-row' }, [el('span', { class: 'price' }, usd(offer.price)), el('span', { class: 'package' }, '促销单标示价格')]),
    el('div', { class: 'meta-grid' }, [
      el('div', { class: 'meta-line' }, [el('span', {}, '优惠期限'), el('strong', {}, `${formatDate(offer.validFrom)}—${formatDate(offer.validUntil)}`)]),
      el('div', { class: 'meta-line' }, [el('span', {}, '区域'), el('strong', {}, '30318 · 约 10 km 购物圈')]),
      el('div', { class: 'meta-line' }, [el('span', {}, '来源状态'), el('strong', {}, direct ? '零售商商品链接' : '整本周促销单')]),
    ]),
    el('div', { class: `source-block ${direct ? 'direct' : 'unlocated'}` }, [
      el('div', { class: 'source-heading' }, [el('strong', {}, direct ? '商品优惠入口' : '来源'), el('span', { class: 'source-status' }, direct ? '直达链接' : '尚未定位')]),
      el('p', {}, direct ? '来源提供零售商商品链接，但没有可靠促销单页码。' : '商品来自当前周促销 feed；数据源未提供可靠页码，因此不猜测页码。'),
      el('a', { class: 'source-link secondary', href: offer.sourceUrl, target: '_blank', rel: 'noopener noreferrer' }, direct ? '打开商品优惠 ↗' : '打开来源促销单 ↗'),
    ]),
  ]);
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
  const categoryIds = [...new Set(offers.map(offer => offer.categoryId))];
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
  const offers = currentOffers();
  const nowOffers = purchasableNow();
  const nextOffers = upcomingOffers();
  const changed = offers.filter(o => o.changeType === 'new' || o.changeType === 'price_drop').length;
  const expiring = nowOffers.filter(o => {
    const days = (new Date(o.validUntil) - now()) / 86400000;
    return days >= 0 && days <= 1.5;
  }).length;
  const comparableNow = nowOffers.filter(o => Number.isFinite(o.unitPriceValue));
  const comparableNext = nextOffers.filter(o => Number.isFinite(o.unitPriceValue));
  const bestNow = [...(comparableNow.length ? comparableNow : nowOffers)].sort(compareOffers).slice(0, 4);
  const bestNext = [...(comparableNext.length ? comparableNext : nextOffers)].sort(compareOffers).slice(0, 4);
  const hero = el('section', { class: 'hero' }, [
    el('h2', {}, '今天去哪家，买什么，一眼就知道。'),
    el('p', {}, '先看现在已经能买的优惠，再看下一期即将开始的优惠。商品原名保留，中文解释完整显示。'),
    el('div', { class: 'hero-meta' }, [
      el('span', { class: 'hero-pill' }, `${nowOffers.length} 项现在能买`),
      el('span', { class: 'hero-pill' }, `${nextOffers.length} 项下期开始`),
      el('span', { class: 'hero-pill' }, `${changed} 项新增或降价`),
      el('span', { class: 'hero-pill' }, `${expiring} 项即将到期`),
    ]),
  ]);

  const quickTitle = sectionTitle('今天值得先看', '中文先告诉你是什么，商品原名保留在下方');
  const quickGrid = bestNow.length ? el('div', { class: 'quick-grid' }, bestNow.map(o =>
    el('button', { class: 'quick-card', onClick: () => go('category', o.categoryId) }, [
      el('span', { class: 'emoji' }, categoryById(o.categoryId)?.emoji || '🛒'),
      el('strong', {}, firstSentence(o.zhExplanation)),
      el('span', { class: 'original-mini' }, o.originalName),
      el('span', {}, `${offerMoney(o)} · ${storeById(o.storeId)?.name || o.storeId}`),
    ])
  )) : el('div', { class: 'empty' }, '目前没有已开始的演示优惠。');

  const nextTitle = sectionTitle('下一期可以留意', '这些优惠还没开始，到开始日期后再去买');
  const nextGrid = bestNext.length ? el('div', { class: 'quick-grid' }, bestNext.map(o =>
    el('button', { class: 'quick-card upcoming-card', onClick: () => go('category', o.categoryId) }, [
      el('span', { class: 'emoji' }, categoryById(o.categoryId)?.emoji || '🛒'),
      el('strong', {}, firstSentence(o.zhExplanation)),
      el('span', { class: 'original-mini' }, o.originalName),
      el('span', {}, `${formatDate(o.validFrom)} 开始 · ${storeById(o.storeId)?.name || o.storeId}`),
    ])
  )) : el('div', { class: 'empty compact' }, '目前没有已录入的下一期优惠。');

  const catTitle = sectionTitle('像口袋书一样翻类别', '每页一个大类，页内比较同类商品');
  const catGrid = el('div', { class: 'quick-grid' }, visibleCategories().map(c => {
    const count = offers.filter(o => o.categoryId === c.id).length;
    return el('button', { class: 'quick-card', onClick: () => go('category', c.id) }, [
      el('span', { class: 'emoji' }, c.emoji),
      el('strong', {}, c.nameZh),
      el('span', {}, `${count} 项促销`),
    ]);
  }));

  return el('main', { class: 'content' }, [statusBanner(), hero, quickTitle, quickGrid, nextTitle, nextGrid, catTitle, catGrid, footerNote()]);
}

function sectionTitle(title, subtitle) {
  return el('div', { class: 'section-title' }, el('div', {}, [el('h2', {}, title), el('p', {}, subtitle)]));
}
function visibleCategories() {
  const ids = new Set(currentOffers().map(o => o.categoryId));
  return activeCategories().filter(c => ids.has(c.id));
}

function categoriesView() {
  const cats = visibleCategories();
  return el('main', { class: 'content' }, [
    sectionTitle('商品分类', '点击一类进入；进入后可左右滑动或点上一类、下一类'),
    el('div', { class: 'quick-grid' }, cats.map(c => {
      const offers = currentOffers().filter(o => o.categoryId === c.id);
      const stores = new Set(offers.map(o => o.storeId)).size;
      return el('button', { class: 'quick-card', onClick: () => go('category', c.id) }, [
        el('span', { class: 'emoji' }, c.emoji),
        el('strong', {}, c.nameZh),
        el('span', {}, `${offers.length} 项 · ${stores} 家商店`),
      ]);
    })),
    footerNote(),
  ]);
}

function categoryView(categoryId) {
  const cats = visibleCategories();
  const index = Math.max(0, cats.findIndex(c => c.id === categoryId));
  const category = cats[index] || cats[0];
  const offers = currentOffers().filter(o => o.categoryId === category.id);
  const groups = groupOffers(offers);
  const main = el('main', { class: 'content', style: `--page-color:${category.color}` }, [
    el('section', { class: 'page-head' }, [
      el('div', { class: 'kicker' }, '商品分类'),
      el('h2', {}, `${category.emoji} ${category.nameZh}`),
      el('p', {}, category.descriptionZh),
      el('span', { class: 'page-counter' }, `第 ${index + 1} 类 / 共 ${cats.length} 类 · ${offers.length} 项`),
    ]),
    ...groups.map(([groupId, groupOffersList]) => renderGroup(groupId, groupOffersList)),
    pager(cats, index),
    footerNote(),
  ]);
  attachSwipe(main, cats, index);
  return main;
}

function attachSwipe(node, cats, index) {
  node.addEventListener('touchstart', e => { state.touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  node.addEventListener('touchend', e => {
    if (state.touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - state.touchStartX;
    state.touchStartX = null;
    if (Math.abs(delta) < 70) return;
    if (delta < 0 && index < cats.length - 1) go('category', cats[index + 1].id);
    if (delta > 0 && index > 0) go('category', cats[index - 1].id);
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
    const av = a[1][0]?.unitPriceValue ?? Infinity;
    const bv = b[1][0]?.unitPriceValue ?? Infinity;
    return av - bv;
  });
}
function compareOffers(a,b) {
  const au = Number.isFinite(a.unitPriceValue) ? a.unitPriceValue : Infinity;
  const bu = Number.isFinite(b.unitPriceValue) ? b.unitPriceValue : Infinity;
  if (au !== bu) return au - bu;
  return (a.price ?? Infinity) - (b.price ?? Infinity);
}
function renderGroup(groupId, offers) {
  const groups = activeComparisonGroups();
  const label = groups[groupId] || groups.other || { nameZh: '其他商品', noteZh: '这些商品的规格不一定完全相同。' };
  return el('section', { class: 'group' }, [
    el('div', { class: 'group-head' }, [el('h3', {}, label.nameZh), el('p', {}, label.noteZh)]),
    el('div', { class: 'offer-list' }, offers.map((o, i) => offerCard(o, i === 0 && Number.isFinite(o.unitPriceValue)))),
  ]);
}

function offerCard(o, best) {
  const store = storeById(o.storeId);
  const badges = [
    el('span', { class: 'badge store', style: `--store-color:${store?.color || '#315f51'}` }, store?.name || o.storeId),
  ];
  if (o.memberOnly) badges.push(el('span', { class: 'badge warning' }, '会员价'));
  if (o.multiBuy) badges.push(el('span', { class: 'badge warning' }, o.multiBuy));
  if (o.changeType === 'new') badges.push(el('span', { class: 'badge' }, '新增'));
  if (o.changeType === 'price_drop') badges.push(el('span', { class: 'badge' }, `降价 ${o.priceDropAmount || ''}`.trim()));
  if (o.status === 'unconfirmed') badges.push(el('span', { class: 'badge warning' }, '等待重新确认'));
  return el('article', { class: `offer-card${best ? ' best' : ''}` }, [
    o.imageUrl ? el('img', { class: 'offer-image', src: o.imageUrl, alt: o.originalName, loading: 'lazy', referrerpolicy: 'no-referrer' }) : null,
    offerTitle(o.originalName),
    el('p', { class: 'zh-explanation' }, o.zhExplanation),
    el('div', { class: 'price-row' }, [el('span', { class: 'price' }, offerMoney(o)), el('span', { class: 'package' }, o.packageText || (o.currency === 'USD' ? '促销单标示价格' : '规格待确认'))]),
    o.unitPriceDisplay ? el('div', { class: 'unit-price' }, `单位价格：${o.unitPriceDisplay}`) : null,
    el('div', { class: 'badges' }, [el('span', { class: `badge ${new Date(o.validFrom) > now() ? 'warning' : ''}` }, availabilityBadge(o)), ...badges]),
    el('div', { class: 'meta-grid' }, [
      el('div', { class: 'meta-line' }, [el('span', {}, '优惠期限'), el('strong', {}, `${formatDate(o.validFrom)}—${formatDate(o.validUntil)}`)]),
      el('div', { class: 'meta-line' }, [el('span', {}, '附近门店'), el('strong', {}, store?.shortAddress || '查看商店页')]),
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
    footerNote(),
  ]);
}

function storeView(storeId) {
  const store = storeById(storeId) || activeStores()[0];
  const offers = currentOffers().filter(o => o.storeId === store.id);
  const categoryIds = [...new Set(offers.map(o => o.categoryId))];
  const catChips = el('div', { class: 'chip-row' }, categoryIds.map(id => {
    const c = categoryById(id);
    return el('button', { class: 'chip', onClick: () => document.getElementById(`store-${store.id}-${id}`)?.scrollIntoView({ block: 'start' }) }, `${c?.emoji || '🛒'} ${c?.nameZh || id}`);
  }));
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
    sectionTitle(`${offers.length} 项当前促销`, `${store.membership}；同类商品使用与首页一致的排序逻辑`),
    offers.length ? catChips : null,
    ...categoryIds.map(id => {
      const c = categoryById(id);
      const list = offers.filter(o => o.categoryId === id);
      return el('section', { id: `store-${store.id}-${id}`, class: 'group' }, [
        el('div', { class: 'group-head' }, [el('h3', {}, `${c?.emoji || ''} ${c?.nameZh || id}`), el('p', {}, `${list.length} 项`)]),
        ...groupOffers(list).map(([gid, group]) => renderGroup(gid, group)),
      ]);
    }),
    offers.length ? null : el('div', { class: 'empty' }, '该商店目前没有可验证的结构化周促销商品。可以使用上方官方入口查看。'),
    footerNote(),
  ]);
}

function searchView() {
  const all = currentOffers();
  const query = state.search.trim().toLowerCase();
  const results = !query ? [] : all.filter(o => [o.originalName, o.originalDescription, o.zhExplanation, storeById(o.storeId)?.name].join(' ').toLowerCase().includes(query));
  const input = el('input', { class: 'search-input', value: state.search, placeholder: '输入中文、丹麦文或英文商品名……', type: 'search' });
  input.addEventListener('input', e => {
    state.search = e.target.value;
    const p = new URLSearchParams({ view: 'search' });
    if (state.search) p.set('q', state.search);
    history.replaceState(null, '', `#${p}`);
    render();
    requestAnimationFrame(() => {
      const again = document.querySelector('.search-input');
      if (again) { again.focus(); again.setSelectionRange(state.search.length, state.search.length); }
    });
  });
  return el('main', { class: 'content' }, [
    el('div', { class: 'search-panel' }, [input, el('p', { class: 'search-hint' }, '同时搜索商品原名、中文解释、商店名称。中文解释不会折叠。')]),
    query ? sectionTitle(`找到 ${results.length} 项`, '有可靠单位价格时优先按单位价格，否则按标示价格排列') : sectionTitle('搜索商品', '例如鸡腿肉、kylling、chicken、Coca-Cola Zero'),
    query ? el('div', { class: 'offer-list' }, results.sort(compareOffers).map((o, i) => offerCard(o, false))) : el('div', { class: 'empty' }, '输入商品名称后显示结果。'),
    footerNote(),
  ]);
}

function footerNote() {
  const defaultText = '促销通常是连锁店级别，附近门店库存可能不同。单位价格只在规格可可靠换算时参与同类排序；会员价、多件价和限购条件会明确标注。';
  return el('p', { class: 'footer-note' }, activeData()?.metadata?.disclaimerZh || defaultText);
}

function render() {
  const root = document.getElementById('app');
  root.replaceChildren(topbar());
  let view;
  if (state.route.view === 'locations') view = locationsView();
  else if (state.route.view === 'categories') view = categoriesView();
  else if (state.route.view === 'category') view = categoryView(state.route.id);
  else if (state.route.view === 'stores') view = storesView();
  else if (state.route.view === 'store') view = storeView(state.route.id);
  else if (state.route.view === 'search') view = searchView();
  else view = homeView();
  root.append(view, bottomNav());
  window.scrollTo({ top: 0, behavior: 'auto' });
}

async function boot() {
  try {
    if (globalThis.__GROCERY_DATA__) {
      state.data = globalThis.__GROCERY_DATA__;
      state.atlantaData = globalThis.__ATLANTA_DATA__ || { metadata: { stale: true, failedStores: [] }, offers: [], flyers: [] };
    } else {
      const [aarhusRes, atlantaRes] = await Promise.all([
        fetch('data/current_offers.json', { cache: 'no-store' }),
        fetch('data/atlanta_offers.json', { cache: 'no-store' }),
      ]);
      if (!aarhusRes.ok) throw new Error(`Aarhus data HTTP ${aarhusRes.status}`);
      state.data = await aarhusRes.json();
      state.atlantaData = atlantaRes.ok
        ? await atlantaRes.json()
        : { metadata: { stale: true, failedStores: [] }, offers: [], flyers: [] };
    }
    const savedLocation = localStorage.getItem(LOCATION_KEY);
    state.locationId = LOCATIONS.some(location => location.id === savedLocation) ? savedLocation : LOCATIONS[0].id;
    parseRoute();
    render();
  } catch (error) {
    document.getElementById('app').innerHTML = `<main class="content"><div class="empty"><strong>数据加载失败</strong><br>${String(error)}</div></main>`;
  }
  if (!globalThis.__GROCERY_DATA__ && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
window.addEventListener('hashchange', () => { parseRoute(); render(); });
boot();
