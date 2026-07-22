import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const appSource = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
const styleSource = await fs.readFile(new URL('../styles.css', import.meta.url), 'utf8');

test('shopping list is local, store-filterable, and keeps completed items recoverable', () => {
  assert.match(appSource, /const SHOPPING_KEY = 'grocery-deals-shopping-v1'/);
  assert.match(appSource, /localStorage\.setItem\(SHOPPING_KEY/);
  assert.match(appSource, /offer\.productKey \|\| offer\.canonicalKey/);
  assert.match(appSource, /\['shopping', '✓'/);
  assert.match(appSource, /还要买/);
  assert.match(appSource, /completedListOpen: false/);
  assert.match(appSource, /open: state\.completedListOpen/);
  assert.match(appSource, /onToggle: event => \{ state\.completedListOpen = event\.currentTarget\.open; \}/);
  assert.match(appSource, /nextView === 'shopping' && previousView !== 'shopping'/);
  assert.match(appSource, /storeFilterBar\(allOffers, '只看准备去的商店'\)/);
  assert.match(appSource, /function shoppingTotal\(offers\)/);
  assert.match(appSource, /当前已选合计/);
  assert.match(appSource, /function updateShoppingQuantity\(offer, change\)/);
  assert.match(appSource, /function updateShoppingQuantityUi\(offer\)/);
  assert.match(appSource, /quantity: Math\.max\(0, current \+ change\)/);
  assert.match(appSource, /offer\.price \* shoppingQuantity\(offer\)/);
  assert.match(appSource, /function updateShoppingQuantity\(offer, change\)[\s\S]*saveShopping\(\);\n  updateShoppingQuantityUi\(offer\);/);
  assert.match(appSource, /data-shopping-key/);
  assert.match(appSource, /只有“移出清单”才会删除/);
  assert.match(appSource, /已加入清单 · 查看清单/);
  assert.match(appSource, /const allWanted = allOffers\.filter/);
  assert.match(styleSource, /\.shopping-total \{/);
  assert.match(styleSource, /position: sticky; top: calc\(var\(--topbar-height/);
  assert.match(styleSource, /\.shopping-stepper \{/);
  assert.match(styleSource, /\.shopping-total-unit \{/);
  assert.match(appSource, /if \(state\.route\.view !== 'shopping'\) root\.append\(topbar\(\)\);/);
  assert.match(appSource, /state\.route\.view === 'shopping'\) return;/);
});

test('store filters support multiple selections across views and scope price comparisons', () => {
  assert.match(appSource, /storeFilters: \[\]/);
  assert.match(appSource, /params\.get\('stores'\) \|\| params\.get\('store'\)/);
  assert.match(appSource, /const selected = new Set\(state\.storeFilters\)/);
  assert.match(appSource, /selected\.has\(storeId\).*selected\.delete\(storeId\)/s);
  assert.match(appSource, /p\.set\('stores', storeFilterKey\(\)\)/);
  assert.match(appSource, /state\.storeFilters\.includes\(store\.id\)/);
  assert.match(appSource, /'aria-pressed': String\(selected\)/);
  assert.match(appSource, /const scopedOffers = filterOffersByStore\(currentOffers\(\)\)/);
  assert.match(appSource, /storeFilterBar\(allOffers, '选择要比较的商店'\)/);
  assert.match(appSource, /价格与最低价只在已选商店之间比较/);
  assert.match(appSource, /storeFilterScroll: \{\}/);
  assert.match(appSource, /function captureStoreFilterScroll\(root\)/);
  assert.match(appSource, /function restoreStoreFilterScroll\(root\)/);
  assert.match(appSource, /data-store-filter-scroll-key/);
  assert.match(appSource, /captureStoreFilterScroll\(root\);[\s\S]*root\.replaceChildren\(\);[\s\S]*restoreStoreFilterScroll\(root\);/);
  assert.match(styleSource, /\.store-filter-row \{[^}]*overscroll-behavior-inline: contain/);
});

test('shopping quantity controls stay compact and update without replacing the card', () => {
  assert.match(styleSource, /\.shopping-quantity-row \{[^}]*grid-template-columns: auto 104px minmax\(82px, 1fr\)/);
  assert.match(styleSource, /\.shopping-stepper \{[^}]*width: 104px/);
  assert.doesNotMatch(styleSource, /\.shopping-stepper \{ grid-column: 1; grid-row: 2; \}/);
  assert.match(appSource, /function updateShoppingQuantity\(offer, change\)[\s\S]*updateShoppingQuantityUi\(offer\);/);
  assert.match(appSource, /function setShoppingStatus\(offer, status\)[\s\S]*render\(\{ preserveScroll: true \}\);/);
});

test('store pages follow the configured homepage category order', () => {
  assert.match(appSource, /function orderedCategoryIds\(offers\)/);
  assert.match(appSource, /activeCategories\(\)\.map\(category => category\.id\)\.filter\(id => present\.has\(id\)\)/);
  assert.equal((appSource.match(/const categoryIds = orderedCategoryIds\(offers\);/g) || []).length, 2);
  assert.match(styleSource, /\.store-category-section > \.group-head \{/);
});

test('global price comparison separates current/upcoming minima and exposes all ties in a modal', () => {
  assert.match(appSource, /candidate\.comparisonGroup === offer\.comparisonGroup/);
  assert.match(appSource, /const isBest = difference <= tolerance/);
  assert.match(appSource, /offerPeriod\(candidate\) === period/);
  assert.match(appSource, /下期新低/);
  assert.match(appSource, /比\$\{periodLabel\}最低贵/);
  assert.match(appSource, /function openLowestModal/);
  assert.match(appSource, /查看 \$\{comparison\.bestOffers\.length\} 个最低商品/);
  assert.match(appSource, /filterOffersByStore\(allOffers\)/);
  assert.match(appSource, /groupDefinition\.comparable === false/);
  assert.match(appSource, /candidate\.unitPriceUnit === unit/);
  assert.match(appSource, /function comparableSortValue/);
  assert.match(appSource, /\(\?:\\\/kg\|\\\/L\)\$/);
});

test('home integrates upcoming offers into normal categories instead of recommendation strips', () => {
  assert.doesNotMatch(appSource, /今天值得先看/);
  assert.doesNotMatch(appSource, /下一期可以留意/);
  assert.match(appSource, /本期和下期商品都放进对应分类/);
});

test('manual refresh checks the active location data file and only replaces changed data', () => {
  assert.match(appSource, /function refreshActiveData/);
  assert.match(appSource, /data\/current_offers\.json/);
  assert.match(appSource, /\?refresh=\$\{Date\.now\(\)\}/);
  assert.match(appSource, /comparableData\(nextData\) !== comparableData\(currentData\)/);
  assert.match(appSource, /已刷新，暂无新数据/);
  assert.match(appSource, /已取得新数据并更新/);
  assert.match(appSource, /刷新失败，仍显示现有数据/);
  assert.match(appSource, /aria-label': refresh\.status === 'checking' \? '正在检查更新' : '刷新并检查数据更新'/);
});

test('Aarhus is the only normal location and archived Atlanta data is an opt-in easter egg', () => {
  assert.match(appSource, /ATLANTA_EASTER_EGG_ENABLED/);
  assert.match(appSource, /get\('city'\) === 'atlanta'/);
  assert.match(appSource, /ATLANTA_EASTER_EGG_ENABLED\s*\? \[AARHUS_LOCATION, ATLANTA_ARCHIVE_LOCATION\]\s*:\s*\[AARHUS_LOCATION\]/);
  assert.match(appSource, /if \(ATLANTA_EASTER_EGG_ENABLED\) \{[\s\S]*fetch\('data\/atlanta_offers\.json'/);
  assert.match(appSource, /const aarhusRes = await fetch\('data\/current_offers\.json'/);
  assert.match(appSource, /LOCATIONS\.length > 1/);
});

test('expired promotions and their empty categories disappear without waiting for the next refresh', () => {
  assert.match(appSource, /!o\.validUntil \|\| new Date\(o\.validUntil\) >= now\(\)/);
  assert.match(appSource, /const ids = new Set\(offers\.map\(o => o\.categoryId\)\)/);
  assert.match(appSource, /activeCategories\(\)\.filter\(c => ids\.has\(c\.id\)\)/);
  assert.match(appSource, /旧优惠已不在本期数据中，暂不显示/);
});

test('nearby store lookup is permission-based, local-only, and keeps original store names copyable', () => {
  assert.match(appSource, /function nearbyStoreControl\(store\)/);
  assert.match(appSource, /store\?\.sourceName \|\| store\?\.name/);
  assert.match(appSource, /class: 'copy-store-btn'/);
  assert.match(appSource, /svgIcon\('copy'\)/);
  assert.match(appSource, /navigator\.clipboard\?\.writeText/);
  assert.match(appSource, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(appSource, /nearestPublicStore/);
  assert.match(appSource, /enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000/);
  assert.match(appSource, /仅在本机计算最近门店/);
  assert.doesNotMatch(appSource, /localStorage\.setItem\([^\n]*(?:latitude|longitude|coords)/i);
  assert.match(styleSource, /\.copy-store-btn svg/);
  assert.match(styleSource, /\.locate-store-btn/);
});

test('installed PWA checks code and data again when returning to the foreground', () => {
  assert.match(appSource, /register\('sw\.js', \{ updateViaCache: 'none' \}\)/);
  assert.match(appSource, /registration\.update\(\)/);
  assert.match(appSource, /controllerchange/);
  assert.match(appSource, /document\.addEventListener\('visibilitychange', refreshAfterResume\)/);
  assert.match(appSource, /window\.addEventListener\('focus', refreshAfterResume\)/);
  assert.match(appSource, /await refreshActiveData\(\)/);
});

test('search page links to the public GitHub repository for stars', () => {
  assert.match(appSource, /github-star-card/);
  assert.match(appSource, /https:\/\/github\.com\/isSiYua\/aarhus-grocery-deals/);
  assert.match(appSource, /打开 GitHub · Star/);
  assert.match(appSource, /求求你了，给我点个 star 吧/);
  assert.match(appSource, /target: '_blank'/);
  assert.match(appSource, /rel: 'noopener noreferrer'/);
  assert.match(styleSource, /\.github-star-link \{/);
  assert.match(styleSource, /\.github-star-action \{/);
});

test('home and search end with a fully visible anti-fraud, privacy, and source disclaimer', () => {
  assert.match(appSource, /所有功能永久免费/);
  assert.match(appSource, /不设置会员或付费功能/);
  assert.doesNotMatch(appSource, /不接受捐款|唯一打赏说明|收款码/);
  assert.match(appSource, /不代表任何超市、Tjek 或 eTilbudsavis/);
  assert.match(appSource, /security\/policy/);
  assert.match(styleSource, /\.public-trust-note \{/);
  assert.match(styleSource, /padding: 14px 10px calc\(var\(--bottom-nav-height, 72px\) \+ 24px\)/);
  assert.equal((appSource.match(/footerNote\(\)/g) || []).length, 3);
  assert.doesNotMatch(appSource, /\.innerHTML\s*=/);
});

test('top bar uses labeled SVG actions instead of ambiguous text glyphs', () => {
  assert.match(appSource, /svgIcon\('refresh'\)/);
  assert.match(appSource, /svgIcon\('search'\)/);
  assert.match(appSource, /el\('span', \{\}, '更新'\)/);
  assert.match(appSource, /el\('span', \{\}, '搜索'\)/);
  assert.match(styleSource, /\.icon-btn svg \{/);
});

test('mobile chrome behaves like a reading app and has no visible handles', () => {
  assert.match(appSource, /function toggleReadingChrome\(\)/);
  assert.match(appSource, /function attachReadingChromeTap\(node\)/);
  assert.match(appSource, /x < innerWidth \* \.18/);
  assert.match(appSource, /state\.chrome = \{ topHidden: mobileReadingMode, bottomHidden: mobileReadingMode \}/);
  assert.doesNotMatch(appSource, /chrome-toggle|topbar-toggle|bottom-nav-toggle/);
  assert.match(styleSource, /\.topbar\.collapsed \{ display: none; \}/);
  assert.match(styleSource, /\.bottom-nav\.collapsed \{ display: none; \}/);
});

test('store pages expose a center-tap category switcher without permanently covering products', () => {
  assert.match(appSource, /store-category-float/);
  assert.match(appSource, /state\.route\.view === 'store'.*setStoreCategoryNavigation\(opening\)/s);
  assert.match(appSource, /function selectStoreCategory/);
  assert.match(styleSource, /\.store-category-float \{ display: none; \}/);
  assert.match(styleSource, /\.store-category-float\.open \{ opacity: 1; pointer-events: auto;/);
});

test('mobile category browsing supports a continuous vertical stream and aligned card turns', () => {
  assert.match(appSource, /function mobileCategoryReader/);
  assert.match(appSource, /groups\.flatMap/);
  assert.match(appSource, /class: 'mobile-reader-stack'/);
  assert.match(appSource, /class: 'reader-page'/);
  assert.match(appSource, /function attachReaderScroll/);
  assert.match(appSource, /document\.elementFromPoint/);
  assert.match(appSource, /function scrollReaderToIndex/);
  assert.match(appSource, /stack\.scrollTo\(\{ top, behavior: smooth \? 'smooth' : 'auto' \}\)/);
  assert.match(appSource, /function turnReaderPage/);
  assert.match(appSource, /function mobileReaderGroupPicker/);
  assert.match(appSource, /function jumpReaderToGroup/);
  assert.match(appSource, /data-reader-group-jump/);
  assert.match(appSource, /scrollReaderToIndex\(index, false\)/);
  assert.match(appSource, /reader-group-option\.active/);
  assert.match(appSource, /state\.readerTransitioning/);
  assert.match(appSource, /reader-exit-left/);
  assert.match(appSource, /reader-enter-right/);
  assert.match(appSource, /\}, 160\);/);
  assert.match(appSource, /\}, 100\);/);
  assert.match(appSource, /function attachReaderSwipe/);
  assert.doesNotMatch(appSource, /左右滑动切换整个大类/);
  assert.doesNotMatch(appSource, /reader-instructions/);
  assert.doesNotMatch(appSource, /reader-subcategory-note/);
  assert.match(appSource, /touchStartY/);
  assert.match(appSource, /Math\.abs\(delta\) < Math\.abs\(verticalDelta\) \* 1\.35/);
  assert.match(styleSource, /scroll-snap-type: y proximity/);
  assert.match(styleSource, /\.reader-page \{ min-height: 100%/);
  assert.match(styleSource, /\.reader-page\.reader-exit-left \{ transform: translateX\(-108%\)/);
  assert.match(styleSource, /\.reader-page\.reader-enter-right \{ transform: translateX\(108%\)/);
  assert.match(styleSource, /\.reader-heading \{ min-width: 0; display: flex/);
  assert.match(styleSource, /\.reader-group-menu \{ position: absolute/);
  assert.match(styleSource, /\.reader-group-option\.active \{[^\n]*background:/);
  assert.match(styleSource, /@keyframes reader-menu-in/);
  assert.match(styleSource, /transition: transform \.15s/);
  assert.match(styleSource, /\.mobile-reader-head h2 \{ min-width: 0; margin: 0/);
  assert.match(styleSource, /height: calc\(100dvh - var\(--topbar-height/);
});

test('mobile offer cards collapse secondary details and strongly mark global minima', () => {
  assert.match(appSource, /function offerDetails/);
  assert.match(appSource, /class: 'offer-details'/);
  assert.match(appSource, /门店与来源/);
  assert.match(styleSource, /\.offer-card\.best \{ border: 3px solid/);
  assert.match(styleSource, /content: '🏆 ' attr\(data-best-label\)/);
});
