# Aarhus 买菜口袋书

一个面向 Aarhus 华人、适合手机与“添加到主屏幕”的免费促销浏览工具。网站只展示公开促销资料，不卖商品、不收款、不接受捐款，也不代表任何超市或促销数据平台。

线上地址：<https://issiyua.github.io/aarhus-grocery-deals/>

## 现在提供什么

- 覆盖 Aarhus 市区及 Aarhus Kommune 内具有公开结构化促销单的主要日常食品连锁。
- 商品原名、具体中文名称与解释、价格、规格、有效期、会员/多件条件和可追溯来源。
- 本期与已公开的下期促销分开比较；同类、同准备状态和兼容规格才进入同一个最低价池。
- 按多家商店筛选、附近门店本地定位、原名/门店名复制、仅保存在浏览器内的购物清单。
- PWA 更新检查：从主屏幕重新打开或回到前台时检查新代码与新数据。
- 过期商品即使尚未等到下一次服务器刷新，也会按 `validUntil` 在浏览器端停止展示；没有任何有效商品的类别自动消失。

## 自动更新与低 token 工作流

GitHub Actions 在丹麦时间每天 **03:17 和 15:17** 检查一次 Tjek / eTilbudsavis 公开促销 feed。选择这两个窗口是为了覆盖夜间换刊和白天补刊，同时避开整点调度拥堵。

日常任务运行：

```sh
npm run update:fallback
npm run check
```

这条路径不调用 OpenAI、Codex 或其他模型 API，日常自动更新的模型 token 消耗为 **0**。系统按“标准化商品原名 + 可比较商品组”复用仓库中的中文说明和分类；同一商品换促销 ID、换日期或换店时无需重新生成说明。

更新器把成功刷新后已消失的促销移入 `data/history.json`，不再放进 `data/current_offers.json`。真正未见过或有歧义的新品会写入两个 pending 文件并暂不公开；Actions 日志会给出 warning，等待一次人工审核后永久复用。只有促销内容、来源状态或待审核队列发生实质变化时，定时任务才提交数据并重新部署 Pages。

完整维护契约见 [AGENT_UPDATE_PLAYBOOK.md](docs/AGENT_UPDATE_PLAYBOOK.md)。

## 数据来源和覆盖边界

Aarhus 使用 Tjek / eTilbudsavis 的公开促销端点。当前覆盖 Lidl、Netto、REMA 1000、365discount、føtex、Bilka、Kvickly、MENY、Løvbjerg、SuperBrugsen、SPAR、Min Købmand、Brugsen、LET-KØB 和 Wolt Market 等有可核验公开 feed 的日常食品商店。Salling Super 与 KFT Jylland 目前没有可发布的同类结构化周促销，只保留商店入口，不伪造价格。

Atlanta 数据已于 2026-07-22 冻结。`data/atlanta_offers.json` 与对应商品知识仍留在仓库作历史记录和彩蛋，但默认网页不下载、不展示，自动任务也不再更新它。

## 隐私、安全与反冒用

- 无账号、无广告 SDK、无分析脚本、无支付、无表单提交和无服务端用户数据库。
- 购物清单与商店筛选保存在访问者自己的浏览器；定位坐标只在设备本地用于计算最近公开门店，不写入 localStorage，也不上传。
- Pages 强制 HTTPS；页面使用内容安全策略，只允许本站脚本和指定促销图片域名。
- 定时工作流使用最小权限，所有 GitHub Actions 固定到完整提交 SHA；仓库不保存模型密钥或支付信息。
- 本项目只有一个 GitHub 管理员。漏洞请使用 GitHub 的私密漏洞报告入口，不要在公开 issue 中发布可利用细节。

反诈骗、数据责任边界和版权说明见 [PUBLIC_NOTICE_ZH.md](PUBLIC_NOTICE_ZH.md)，漏洞报告流程见 [SECURITY.md](SECURITY.md)。

## 容量

首页代码和当前 Aarhus JSON 由 GitHub Pages/Fastly 静态分发。当前 JSON 原始约 3.9 MB，经线上 gzip 后约 0.5 MB；图片由促销来源的图片 CDN 提供，不计入本仓库 Pages 数据文件流量。500–1000 名普通用户远低于 GitHub Pages 官方说明的每月 100 GB 软带宽限制；若以后出现数万名高频日活或收到限流通知，再迁移到专用 CDN。

## 本地维护

```sh
npm run update:fallback
npm run taxonomy:migrate   # 只有分类或中文审核规则变化时
npm run check
npm run build:preview
npm run serve
```

`data/current_offers.json` 是当前 Aarhus 页面数据；`data/history.json` 最多保留最近 3000 条被替换、撤回或过期记录；商品说明、固定分类和稳定身份分别保存在对应知识 JSON 中。

## 版权与使用

仓库目前没有授予开源再利用许可证，因此适用默认版权规则。GitHub 的服务条款仍允许其他用户查看并通过 GitHub 功能 fork 公开仓库，但这不授权任何人冒充作者、使用“买菜口袋书”名义收款或声称得到本项目背书。零售商名称、商品图片与促销资料的权利属于各自权利人。
