# GitHub 仓库防护设置

仓库中的测试、`CODEOWNERS` 和工作流只能提供技术门禁；以下 GitHub 设置属于仓库外部状态，必须由所有者在仓库 **Settings → Rules → Rulesets** 中启用，代码本身不能替所有者打开。

## `main` 分支规则

为默认分支 `main` 创建 Active ruleset，并启用：

- Require a pull request before merging；至少 1 个 approval。
- Require review from Code Owners。
- Dismiss stale approvals when new commits are pushed。
- Require conversation resolution before merging。
- Require status checks：`Publication gate / check` 与 `CodeQL / Analyze JavaScript`。
- Block force pushes；Restrict deletions。
- 不允许普通协作者绕过规则；仅仓库所有者保留紧急恢复权限。

如果希望定时数据任务继续直接提交 `main`，只给 GitHub Actions 的受信任更新工作流最小化 bypass；不要给所有协作者 bypass。更保守的做法是让定时任务也创建 PR，由所有者审核后合并。

## Actions 设置

在 **Settings → Actions → General** 中：

- Actions permissions 只允许仓库中明确需要的 Actions。
- Workflow permissions 默认选择 Read repository contents。
- 仅当“自动创建数据 PR”工作流需要时，允许 GitHub Actions 创建 Pull Request。
- Fork pull request workflows 不提供 secrets；首次贡献者运行前要求批准。

## 实际安全边界

- 任何人都能查看、clone 和 fork 公开仓库，这是公开项目的正常行为。
- 只有被授予权限的人才能向原仓库推送；普通用户只能推送自己的 fork。
- Pull Request 不等于发布。必须经过自动门禁、CODEOWNERS 审核并合并到 `main`，才会触发 Pages。
- 明显的收款、募捐、索要验证码、链接或脚本注入会被数据验证拒绝；但语义隐蔽的虚假信息仍需要人工审核。
- 不要把不熟悉的人设为 Write/Maintain/Admin，也不要向 PR 工作流提供部署密钥或模型密钥。
