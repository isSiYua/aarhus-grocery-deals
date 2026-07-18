# 部署到固定在线网址

## 最终效果

部署后使用固定网址：

```text
https://<GitHub用户名>.github.io/<仓库名>/
```

页面每天按丹麦时间 07:00 检查一次数据。未变化商品继续保留；变化商品替换并归档；数据源失败时保留上一版记录。

## 一次性部署

1. 在 GitHub 新建一个仓库，例如 `aarhus-grocery-deals`。
2. 将本项目全部文件上传至仓库默认分支。
3. 打开仓库 `Settings → Pages`。
4. 在 `Build and deployment` 中把 Source 设为 `GitHub Actions`。
5. 打开 `Actions → Update deals and deploy → Run workflow`，手动运行一次。
6. 部署成功后，在 Pages 设置页或工作流结果中打开固定网址。

## iPhone 添加到主屏幕

1. 用 Safari 打开网站。
2. 点击分享按钮。
3. 选择“添加到主屏幕”。
4. 以后可像普通 App 一样打开。

## 日常维护

通常不需要人工操作。若页面显示“等待重新确认”，表示当天的数据源或单个商店没有成功刷新，系统正在保留上一版商品，而不是误删记录。
