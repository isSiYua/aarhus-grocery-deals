# Aarhus + Atlanta 买菜口袋书

一个为手机设计的持续更新促销看板。默认按商品类别像口袋书一样翻页，也可以按附近商店查看。

## 已实现

- 固定在线网址的 PWA，可添加到 iPhone 主屏幕
- 隐私安全的地点切换：Aarhus V 与 Atlanta Westside 都可在站内查看商品级促销
- 每个商品大类一页，类内纵向滚动；支持上一类、下一类和左右滑动
- 同类商品放在一起，按可比较的单位价格从低到高排列
- 商品原名在前，完整中文解释默认展开；AI 说明按稳定商品键生成一次后永久复用
- 独立商店视图：品牌色、附近地址、距离说明、会员要求、地图和促销单链接
- 饮料只保留有促销的 Coca-Cola Zero 或 Sprite Zero
- 每天增量更新：未变化保留；变化替换并归档；仅数据源失败时保留旧记录并标注“等待重新确认”
- GitHub Pages 部署和每天 07:00（Europe/Copenhagen）更新工作流
- 离线应用壳与上一次已缓存数据

## 数据来源

更新器对 Aarhus 使用 Tjek / eTilbudsavis 的公开促销数据端点，对 Atlanta 使用 Flipp 的公开 weekly-ad feed。促销通常是连锁店或邮编区域级别，不能保证某一家门店当天库存。项目不下载促销图片，只保存商品文字、价格、有效期、远程图片链接和促销来源链接。

API 客户端结构参考了 MIT 许可的 `olgasafonova/tilbudstrolden-mcp` 项目所公开的端点使用方式，但本项目界面、分类、中文解释、增量合并和部署流程均为独立实现。

Atlanta Westside 使用 30318 粗粒度邮编匹配当前周促销，在站内显示商品、美元价格、有效期和来源。Kroger、Publix、Target 与 Walmart 有可解析的商品 feed；没有结构化 feed 的门店保留官方入口并明确显示为空，不伪造商品。每个 Flipp 商品来源链接固定使用 `en-us/atlanta-ga/item/<item-id>-<merchant>-<flyer>` 和 `postal_code=30318`，点击后直接打开对应商品卡片，也不会根据访问者所在国家跳回其他城市。Flipp 没有提供可靠页码，因此使用商品 ID 直达定位而不猜测页码。

浏览首页、分类和搜索结果时可以先按商店筛选；筛选状态会继续带到商品页和购物清单。每张商品卡都能加入仅保存在当前浏览器的购物清单，清单按商店分组，已买到的商品置灰并默认收起，可随时恢复。最低价按当前地点的全部商店计算：并列最低全部高亮，非最低商品显示与全局最低的单位价或标示价差额，单店筛选不会重算最低价。

## 隐私

地点只使用粗粒度区域标签。当前地点选择保存在访问者自己的浏览器中；公开仓库不保存、上传或显示用户及其家人的精确住址、姓名或个人邮箱。页面中的具体街道地址仅属于公开营业的商店。

## 本地预览

```bash
npm test
npm run validate
npm run serve
```

浏览器打开 `http://localhost:8080`。

## 可复用的 AI 商品说明

`data/product_descriptions_zh.json` 是随仓库版本控制的中文商品知识缓存；键由标准化商品原名和比较组组成，不含商店、价格或包装规格，因此同一商品跨商店、跨日期只生成一次。`data/product_descriptions_pending.json` 只保存尚未生成的公开商品资料。网页本身不会调用 OpenAI，也不会接触 API 密钥；没有密钥时继续使用本地规则说明。

要为队列生成说明，请把 OpenAI API key 放在环境变量中，切勿写入文件：

```bash
npm run descriptions:queue
read -s "OPENAI_API_KEY?OpenAI API key: " && export OPENAI_API_KEY && echo
npm run descriptions:generate -- --limit 100
unset OPENAI_API_KEY
npm run validate
```

GitHub Actions 会读取仓库的 `OPENAI_API_KEY` Actions secret，每天最多处理 100 个未见过的商品；已缓存商品不会再次请求模型。可用 `OPENAI_DESCRIPTION_MODEL` 改写默认模型 `gpt-5.6-sol`。

## 发布到固定网址

1. 新建一个 GitHub 仓库并上传本目录全部文件。
2. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
3. 手动运行一次 `Update deals and deploy` 工作流。
4. 以后每天自动检查一次；网址保持不变。

当前附带的是界面演示数据。首次成功运行工作流后会切换为 live 模式并替换为仍有效的实时促销。

## 数据模型

`data/current_offers.json` 保存当前有效记录和页面配置；`data/history.json` 保存被替换或过期的历史记录。购物商品身份使用“商店 + 标准化原名 + 规格”生成；AI 说明另用不含商店和规格的稳定键，以便长期复用。

## 已知边界

- Tjek 数据中并非每条商品都含可精确换算的规格；缺少规格时不会伪造单位价格。
- Aarhus 优惠直接采用 Tjek 明确提供的 `catalog_page`、`catalog_id`、商品 ID 和商品裁切图；来源链接准确打开所属促销单与商品，绝不推算页码。
- Flipp 当前商品 feed 不提供可靠页码，因此 Atlanta 使用 feed 明确提供的商品 ID 生成商品弹窗直达链接，不根据画布坐标推算页码。
- 未配置 OpenAI API key 或 AI 队列尚未处理时，中文解释使用确定性词典与规则作为回退；页面会保留说明来源，不能把规则文本冒充成 AI 结果。

## 促销单定位原则（v0.3）

页面使用三种来源状态：

- `verified`：页码由数据源明确提供或经人工核验，显示准确页码和位置；
- `direct`：存在商品级直达链接，但没有可靠页码；
- `unlocated`：只有整本促销单来源，明确标注尚未定位。

系统禁止猜测页码。Tjek 明确提供的页码在每日更新时自动写入；人工或其他可信流程核验后的定位写入 `data/source_locators.json`，再运行 `npm run locate`。
