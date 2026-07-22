# 多人维护指南

欢迎帮助维护 Aarhus 促销数据。公开用户不能直接修改线上页面；任何数据或代码变化都必须经过 GitHub Pull Request、自动检查和仓库所有者审核。

## 最安全的参与方式

1. 先在 Issues 使用“领取一次连锁促销更新”模板，写明商店和刊期，避免重复劳动。
2. Fork 仓库，从最新 `main` 创建自己的分支。
3. 只刷新自己领取的连锁，例如：

   ```sh
   git fetch upstream
   git switch main
   git merge --ff-only upstream/main
   git switch -c data/rema-2026-07-26
   npm run update:stores -- rema
   ```

4. 检查 `data/product_descriptions_pending.json` 与 `data/product_taxonomy_pending.json`。
5. 没有新品时，已有中文说明和分类会直接复用，模型 token 消耗为 0。
6. 有新品时，只审核这次新增的 pending；把永久结论写入 `data/product_review_overrides_zh.json` 或可复用规则，运行：

   ```sh
   npm run taxonomy:migrate
   npm run review:products
   npm run update:stores -- rema
   npm run check
   npm run build:preview
   ```

7. pending 必须为 0，手机预览检查合格后再提交 PR。
8. PR 合并前如果 `main` 已有其他人的更新，先 rebase/合并最新 `main` 并重新执行检查。这样 B 的 Lidl 更新会自然包含 A 已合并的 REMA 数据和商品知识。

可用连锁 ID：`rema`、`lidl`、`netto`、`365`、`foetex`、`bilka`、`kvickly`、`meny`、`loevbjerg`、`superbrugsen`、`spar`、`min_koebmand`、`brugsen`、`letkoeb`、`salling`、`wolt_market`。

## 仓库内一键更新

拥有仓库 Actions 运行权限的可信维护者可以运行 **Refresh selected grocery chains**，输入 `rema` 或 `lidl,netto`。工作流会从触发时最新的 `main` 开始，只刷新指定连锁，运行完整检查，并创建独立 PR；不会直接覆盖其他人的数据。

## 为什么同一商品不会重复消耗 token

- `descriptionKey` 由标准化原名、严格比价组和必要的选项证据组成，不依赖促销 ID、日期或商店。
- 审核后的中文名、解释和分类保存在 Git 仓库的共享知识 JSON 中。
- 不同商店或下个刊期遇到同一身份时直接复用。
- 两个维护者同时遇到同一新品时，以先合并的 PR 为准；后一个 PR 必须同步 `main`，然后重新运行更新，重复 pending 会自动消失。

## 权限和安全

- 普通贡献者使用 Fork + PR，不需要仓库写权限。
- 不接受从网页直接投稿或修改数据。
- 不得加入支付、捐款、广告、追踪、用户账号、远程管理或公开写入接口。
- 不得提交个人位置、登录 cookie、API 密钥、模型密钥或任何用户资料。
- 商品中文解释必须有公开促销文字、图片或可靠商品资料依据，不能猜测。
- 仓库所有者与 `CODEOWNERS` 保留最终审核和拒绝权限。

完整的数据质量规则见 [docs/AGENT_UPDATE_PLAYBOOK.md](docs/AGENT_UPDATE_PLAYBOOK.md)。
