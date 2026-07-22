# Aarhus 买菜口袋书部署与日常维护

固定网址：<https://issiyua.github.io/aarhus-grocery-deals/>

GitHub Actions 在丹麦时间每天 03:17 和 15:17 检查 Aarhus 促销单。日常更新使用本地规则与已审核知识库，不需要模型 API 或 token。只有数据、来源状态或待审核队列实际变化时才自动提交和部署；手动运行工作流会强制部署代码更新。

## iPhone 添加到主屏幕

1. 用 Safari 打开固定网址。
2. 点击分享按钮。
3. 选择“添加到主屏幕”。
4. 以后重新打开或切回前台时，应用会检查新版代码和促销数据。

## 促销换期

- 新促销中仍存在的已知商品直接复用中文说明与分类。
- 成功刷新后消失的旧促销立即从当前数据移入历史，不再展示。
- `validUntil` 已到期的商品会在浏览器端即时隐藏；若某类别没有有效商品，该类别也自动隐藏。
- 从未见过或存在歧义的商品进入 pending 队列并暂不发布，避免自动猜错。
- 数据源失败时只把受影响来源标记为待确认，不会把失败误当成促销撤回。

## 发布前命令

```sh
npm run update:fallback
npm run check
npm run build:preview
```

公开宣传前同时阅读 [PUBLIC_NOTICE_ZH.md](PUBLIC_NOTICE_ZH.md) 与 [SECURITY.md](SECURITY.md)。
