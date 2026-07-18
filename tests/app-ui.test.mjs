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
  assert.match(appSource, /details', \{ class: 'completed-list'/);
  assert.match(appSource, /storeFilterBar\(allOffers, '只看准备去的商店'\)/);
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
});

test('home integrates upcoming offers into normal categories instead of recommendation strips', () => {
  assert.doesNotMatch(appSource, /今天值得先看/);
  assert.doesNotMatch(appSource, /下一期可以留意/);
  assert.match(appSource, /本期和下期商品都放进对应分类/);
});

test('manual refresh checks the active location data file and only replaces changed data', () => {
  assert.match(appSource, /function refreshActiveData/);
  assert.match(appSource, /data\/atlanta_offers\.json/);
  assert.match(appSource, /data\/current_offers\.json/);
  assert.match(appSource, /\?refresh=\$\{Date\.now\(\)\}/);
  assert.match(appSource, /comparableData\(nextData\) !== comparableData\(currentData\)/);
  assert.match(appSource, /已刷新，暂无新数据/);
  assert.match(appSource, /已取得新数据并更新/);
  assert.match(appSource, /刷新失败，仍显示现有数据/);
  assert.match(appSource, /aria-label': refresh\.status === 'checking' \? '正在检查更新' : '刷新并检查数据更新'/);
});

test('mobile chrome can be collapsed independently and remembers the preference', () => {
  assert.match(appSource, /const CHROME_KEY = 'grocery-deals-mobile-chrome-v1'/);
  assert.match(appSource, /function toggleChrome\(part\)/);
  assert.match(appSource, /toggleChrome\('top'\)/);
  assert.match(appSource, /toggleChrome\('bottom'\)/);
  assert.match(appSource, /aria-expanded/);
  assert.match(styleSource, /\.topbar\.collapsed/);
  assert.match(styleSource, /\.bottom-nav\.collapsed/);
});

test('mobile category browsing keeps subcategory context and ignores vertical gestures', () => {
  assert.match(appSource, /class: 'content category-content'/);
  assert.match(appSource, /左右滑动切换整个大类/);
  assert.match(appSource, /touchStartY/);
  assert.match(appSource, /Math\.abs\(delta\) < Math\.abs\(verticalDelta\) \* 1\.35/);
  assert.match(styleSource, /\.category-content \.group-head \{ position: sticky/);
});

test('mobile offer cards collapse secondary details and strongly mark global minima', () => {
  assert.match(appSource, /function offerDetails/);
  assert.match(appSource, /class: 'offer-details'/);
  assert.match(appSource, /门店与来源/);
  assert.match(styleSource, /\.offer-card\.best \{ border: 3px solid/);
  assert.match(styleSource, /content: '🏆 ' attr\(data-best-label\)/);
});
