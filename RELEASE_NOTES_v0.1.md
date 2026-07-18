# v0.1 首版开发结果

- 手机优先 PWA 与固定网址部署结构
- 口袋书式商品类别翻页与左右滑动
- 类内同类商品按单位价格排序
- 商品原名 + 完整中文解释，禁止折叠
- 独立商店视图、店铺主题、会员要求、地址、地图和促销单入口
- Coca-Cola Zero / Sprite Zero 白名单规则
- 每日增量合并、历史归档和失败保留
- GitHub Pages 与 GitHub Actions 自动部署
- 内嵌单文件手机预览版
- 自动化测试 5/5 通过；演示数据校验 37/37 通过

当前 `data/current_offers.json` 标记为 demo。首次在可联网的 GitHub Actions 环境成功运行更新器后，会切换为 live。
