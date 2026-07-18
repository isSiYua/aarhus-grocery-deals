# Aarhus Grocery Deals v0.3 — Codex 部署任务

## 任务类型

开发 + 部署 + QA 任务。

## 目标

将本目录部署到用户自己的 GitHub 仓库，并发布为 GitHub Pages 固定网址。保留每日增量更新、手机 PWA、按品类翻页、按商店查看以及真实来源定位状态。

## 重要事实

1. Tjek/eTilbudsavis 的公开优惠条目接口能提供商品、价格和有效期，但不稳定地提供促销单页码。
2. 不得根据商品顺序、图片顺序或猜测生成页码。
3. 只有 `data/source_locators.json` 中经过核验的记录，才可显示“促销单准确定位”。
4. 未定位商品在页面上只显示“尚未定位 + 打开整本促销单”，不得显示空页码框。
5. Tjek 官方说明其完整 API/SDK 面向客户，正式 publication reader/hotspot 能力不是公开免费接口。因此本项目当前采用公开优惠 feed + 可审计的人工/外部核验定位覆盖层。

## 输入目录

将 ZIP 解压为一个独立仓库，例如：

```text
~/Documents/aarhus-grocery-deals
```

## 仓库建议

```text
aarhus-grocery-deals
```

建议先设为 Public，以便免费使用 GitHub Pages。不要放入地址以外的敏感个人信息，不要提交密钥。

## 必须执行

### 1. 本地验证

```bash
npm test
npm run validate
npm run build:preview
```

必须全部通过。

### 2. 检查 GitHub CLI

```bash
gh auth status
```

未登录时停止并提示用户执行：

```bash
gh auth login
```

不得猜测或代替用户认证。

### 3. 初始化并发布仓库

若目录尚未是 Git 仓库：

```bash
git init
git branch -M main
git add .
git commit -m "feat: launch Aarhus grocery deals pocketbook"
gh repo create aarhus-grocery-deals --public --source=. --remote=origin --push
```

若用户已经创建空仓库，则添加对应 remote 后 push。不得覆盖已有非空仓库。

### 4. 启用 GitHub Pages

仓库 Settings → Pages → Source 选择 **GitHub Actions**。

若 `gh api` 权限足够，也可用 API 配置；配置失败时给用户明确的手动步骤，不得声称已完成。

### 5. 运行一次工作流

在 GitHub Actions 中手动运行：

```text
Update deals and deploy
```

或者：

```bash
gh workflow run "Update deals and deploy"
```

随后检查最新 workflow run：

```bash
gh run list --workflow "Update deals and deploy" --limit 5
gh run watch <RUN_ID>
```

### 6. 验证线上页面

必须验证：

- 固定网址可访问；
- 首页显示“现在能买”和“下一期可以留意”；
- “今天值得先看”中文优先；
- 分类页可上一类/下一类和左右滑动；
- 商店页视觉和商店信息不同；
- 中文解释完整显示，不折叠；
- 无真实页码的商品只显示“尚未定位”；
- `sourceLocation.status=verified` 的商品才显示准确页码；
- Coca-Cola Zero / Sprite Zero 没有促销时，不显示饮料分类；
- Service Worker 不阻碍新版本更新。

## 来源定位数据模型

每个优惠可包含：

```json
{
  "sourceLocation": {
    "status": "unlocated | direct | verified",
    "pageNumber": null,
    "positionLabel": null,
    "deepLink": null,
    "verifiedAt": null,
    "method": null
  }
}
```

### verified

只有人工检查促销单或可信数据源明确返回页码后才能写：

```json
{
  "canonicalKey": "...",
  "status": "verified",
  "pageNumber": 8,
  "positionLabel": "页面右下区域",
  "deepLink": "https://...",
  "verifiedAt": "2026-07-18T08:00:00+02:00",
  "method": "manual_flyer_review"
}
```

写入：

```text
data/source_locators.json
```

然后运行：

```bash
npm run locate
npm run validate
```

### direct

商品级链接可直达，但没有可靠页码时：

```json
{
  "canonicalKey": "...",
  "status": "direct",
  "deepLink": "https://...",
  "method": "offer_deep_link"
}
```

不得把 direct 标成 verified。

## 每日自动更新

工作流每天尝试在 Europe/Copenhagen 07:00 运行。GitHub cron 使用 UTC，因此 workflow 在 05:17 和 06:17 UTC 触发，再用 Copenhagen 本地小时 guard，只执行一次。

每日流程：

```text
测试 → 获取优惠 → 应用已核验定位 → 数据校验 → 提交数据变化 → 部署 Pages
```

公开数据源失败时，旧记录应保留为 `unconfirmed`，不能清空页面。

## 第一版部署边界

这次部署必须完成固定网址和每日更新，但不要求一次性给全部商品补齐页码。页码匹配是单独的数据质量工作，必须以准确性优先。页面已对未定位状态做诚实降级。

## 完成后回报

只需返回：

1. GitHub 仓库链接；
2. GitHub Pages 固定网址；
3. 首次 workflow run 结果；
4. `npm test` 和 `npm run validate` 结果；
5. 当前 live 商品数、已核验页码数、直达链接数、未定位数；
6. 任何仍需用户操作的步骤。
