const state = {
  data: null,
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
    mode: 'flyers',
    descriptionZh: '美国官方优惠入口：显示附近门店、门店地址与各品牌实时优惠页。',
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
const now = () => new Date();
const activeLocation = () => LOCATIONS.find(location => location.id === state.locationId) || LOCATIONS[0];
const isAarhusLocation = () => activeLocation().id === 'aarhus-v';
const activeStores = () => isAarhusLocation() ? state.data.stores : ATLANTA_STORES;
const currentOffers = () => isAarhusLocation() ? state.data.offers.filter(o => o.status !== 'expired') : [];
const purchasableNow = () => currentOffers().filter(o => new Date(o.validFrom) <= now() && new Date(o.validUntil) >= now());
const upcomingOffers = () => currentOffers().filter(o => new Date(o.validFrom) > now());
const firstSentence = text => String(text || '').split(/(?<=[。！？])/)[0] || '查看中文说明';
const availabilityBadge = o => new Date(o.validFrom) > now() ? `下期开始 ${formatDate(o.validFrom)}` : '现在能买';
const storeById = id => activeStores().find(s => s.id === id);
const categoryById = id => state.data.categories.find(c => c.id === id);

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
        el('p', {}, isAarhusLocation() ? `${location.label} · 更新于 ${formatUpdated(state.data.metadata.updatedAt)}` : `${location.label} · 官方优惠入口`),
      ]),
    ]),
    el('div', { class: 'topbar-actions' }, [
      el('button', { class: 'icon-btn', 'aria-label': '切换地点', onClick: () => go('locations') }, '◎'),
      isAarhusLocation() ? el('button', { class: 'icon-btn', 'aria-label': '搜索', onClick: () => go('search') }, '⌕') : null,
    ]),
  ]));
}

function bottomNav() {
  const items = isAarhusLocation() ? [
    ['home', '⌂', '首页'],
    ['categories', '▤', '分类'],
    ['stores', '⌖', '商店'],
    ['search', '⌕', '搜索'],
  ] : [
    ['home', '⌂', '首页'],
    ['stores', '⌖', '商店'],
    ['locations', '◎', '地点'],
  ];
  return el('nav', { class: `bottom-nav${items.length === 3 ? ' three' : ''}`, 'aria-label': '主导航' }, items.map(([view, icon, label]) =>
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
  return el('article', { class: 'store-card atlanta-store-card', style: `--store-color:${store.color}` }, [
    el('h3', {}, store.name),
    el('p', {}, `${store.shortAddress} · ${store.distanceLabel}`),
    el('div', { class: 'store-stats' }, [el('span', { class: 'store-stat' }, store.membership)]),
    el('p', {}, store.descriptionZh),
    el('div', { class: 'store-links atlanta-links' }, [
      el('a', { href: store.flyerUrl, target: '_blank', rel: 'noopener noreferrer' }, '打开官方优惠 ↗'),
      el('a', { href: store.mapUrl, target: '_blank', rel: 'noopener noreferrer' }, '地图 ↗'),
      el('a', { href: store.website, target: '_blank', rel: 'noopener noreferrer' }, '门店页 ↗'),
    ]),
  ]);
}

function atlantaHomeView() {
  const location = activeLocation();
  return el('main', { class: 'content' }, [
    el('section', { class: 'hero atlanta-hero' }, [
      el('h2', {}, 'Atlanta Westside 附近优惠单'),
      el('p', {}, '以 10 km（约 6.2 英里）作为方便购物区。这里只保存区域标签，不保存任何私人住址。'),
      el('div', { class: 'hero-meta' }, [
        el('span', { class: 'hero-pill' }, `${ATLANTA_STORES.length} 家已核验门店`),
        el('span', { class: 'hero-pill' }, `${location.radiusLabel} 默认半径`),
        el('span', { class: 'hero-pill' }, '官方优惠入口'),
      ]),
    ]),
    sectionTitle('附近商店与优惠', '优惠和库存以各商店官方页面为准'),
    el('div', { class: 'store-grid' }, ATLANTA_STORES.map(atlantaStoreCard)),
    el('p', { class: 'footer-note' }, 'Atlanta 暂不使用丹麦商品 feed，因此不会伪造统一页码或商品数据。官方页面会自行更新 Weekly Ad、Rollback 或会员优惠。'),
  ]);
}

function atlantaStoresView() {
  return el('main', { class: 'content' }, [
    sectionTitle('Atlanta Westside 商店', '默认显示 10 km 购物圈；实际驾车时间请用地图确认'),
    el('div', { class: 'store-grid' }, ATLANTA_STORES.map(atlantaStoreCard)),
  ]);
}

function statusBanner() {
  if (state.data.metadata.mode !== 'demo' && !state.data.metadata.stale) return null;
  const text = state.data.metadata.mode === 'demo'
    ? '当前是可交互的首版演示数据。部署后，每日更新程序会从促销数据源替换为真实且仍有效的商品。'
    : '今天的数据源没有全部成功刷新，因此页面暂时保留上一次确认有效的记录。';
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
  const bestNow = [...nowOffers].filter(o => Number.isFinite(o.unitPriceValue)).sort(compareOffers).slice(0, 4);
  const bestNext = [...nextOffers].filter(o => Number.isFinite(o.unitPriceValue)).sort(compareOffers).slice(0, 4);
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
      el('span', {}, `${money(o.price)} · ${storeById(o.storeId)?.name || o.storeId}`),
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
  return state.data.categories.filter(c => ids.has(c.id));
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
  const label = state.data.comparisonGroups[groupId] || state.data.comparisonGroups.other || { nameZh: '其他商品', noteZh: '这些商品的规格不一定完全相同。' };
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
    el('h4', {}, o.originalName),
    el('p', { class: 'zh-explanation' }, o.zhExplanation),
    el('div', { class: 'price-row' }, [el('span', { class: 'price' }, money(o.price)), el('span', { class: 'package' }, o.packageText || '规格待确认')]),
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
      el('p', {}, `第 ${loc.pageNumber} 页${position}。按商品原名“${o.originalName}”核对。`),
      href ? el('a', { class: 'source-link', href, target: '_blank', rel: 'noopener noreferrer' }, `打开促销单第 ${loc.pageNumber} 页 ↗`) : null,
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
      const cheapest = storeOffers.filter(o => Number.isFinite(o.unitPriceValue)).sort(compareOffers)[0];
      return el('button', { class: 'store-card', style: `--store-color:${store.color}`, onClick: () => go('store', store.id) }, [
        el('h3', {}, store.name),
        el('p', {}, `${store.shortAddress} · ${store.distanceLabel}`),
        el('div', { class: 'store-stats' }, [
          el('span', { class: 'store-stat' }, `${storeOffers.length} 项优惠`),
          el('span', { class: 'store-stat' }, store.membership),
          cheapest ? el('span', { class: 'store-stat' }, `低价示例 ${money(cheapest.price)}`) : null,
        ]),
      ]);
    })),
    footerNote(),
  ]);
}

function storeView(storeId) {
  const store = storeById(storeId) || state.data.stores[0];
  const offers = currentOffers().filter(o => o.storeId === store.id);
  const categoryIds = [...new Set(offers.map(o => o.categoryId))];
  const catChips = el('div', { class: 'chip-row' }, categoryIds.map(id => {
    const c = categoryById(id);
    return el('button', { class: 'chip', onClick: () => document.getElementById(`store-${store.id}-${id}`)?.scrollIntoView({ block: 'start' }) }, `${c?.emoji || '🛒'} ${c?.nameZh || id}`);
  }));
  return el('main', { class: 'content', style: `--store-color:${store.color}` }, [
    el('section', { class: 'store-hero' }, [
      el('h2', {}, store.name),
      el('p', {}, `${store.shortAddress} · ${store.distanceLabel}\n${store.descriptionZh}`),
      el('div', { class: 'store-links' }, [
        el('a', { href: store.mapUrl, target: '_blank', rel: 'noopener noreferrer' }, '地图导航 ↗'),
        el('a', { href: store.flyerUrl, target: '_blank', rel: 'noopener noreferrer' }, '本周促销单 ↗'),
        el('a', { href: store.website, target: '_blank', rel: 'noopener noreferrer' }, '商店官网 ↗'),
      ]),
    ]),
    sectionTitle(`${offers.length} 项当前促销`, `${store.membership}；同类仍按单位价格排序`),
    catChips,
    ...categoryIds.map(id => {
      const c = categoryById(id);
      const list = offers.filter(o => o.categoryId === id);
      return el('section', { id: `store-${store.id}-${id}`, class: 'group' }, [
        el('div', { class: 'group-head' }, [el('h3', {}, `${c?.emoji || ''} ${c?.nameZh || id}`), el('p', {}, `${list.length} 项`)]),
        ...groupOffers(list).map(([gid, group]) => renderGroup(gid, group)),
      ]);
    }),
    footerNote(),
  ]);
}

function searchView() {
  const all = currentOffers();
  const query = state.search.trim().toLowerCase();
  const results = !query ? [] : all.filter(o => [o.originalName, o.originalDescription, o.zhExplanation, storeById(o.storeId)?.name].join(' ').toLowerCase().includes(query));
  const input = el('input', { class: 'search-input', value: state.search, placeholder: '输入中文或丹麦文：鸡腿、kylling、饺子……', type: 'search' });
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
    query ? sectionTitle(`找到 ${results.length} 项`, '搜索结果按单位价格排列') : sectionTitle('搜索商品', '例如鸡腿肉、烟熏香肠、Coca-Cola Zero'),
    query ? el('div', { class: 'offer-list' }, results.sort(compareOffers).map((o, i) => offerCard(o, false))) : el('div', { class: 'empty' }, '输入商品名称后显示结果。'),
    footerNote(),
  ]);
}

function footerNote() {
  return el('p', { class: 'footer-note' }, '促销通常是连锁店级别，附近门店库存可能不同。单位价格只在规格可可靠换算时参与同类排序；会员价、多件价和限购条件会明确标注。');
}

function render() {
  const root = document.getElementById('app');
  root.replaceChildren(topbar());
  let view;
  if (state.route.view === 'locations') view = locationsView();
  else if (!isAarhusLocation()) {
    view = state.route.view === 'stores' ? atlantaStoresView() : atlantaHomeView();
  } else if (state.route.view === 'categories') view = categoriesView();
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
    } else {
      const res = await fetch('data/current_offers.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.data = await res.json();
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
