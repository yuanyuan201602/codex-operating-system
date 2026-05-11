# Daily Codex Startup Sync

Updated: 2026-05-11

## Goal

每天开机后打开 Codex，先自动完成一轮工作区同步检查：

- 拉取本仓库最新的跨设备规则、项目索引和通用 Skill Pack。
- 检查已登记业务项目是否有本地未提交变更。
- 对待提交文件做基础敏感内容扫描。
- 默认不自动推送业务项目内容，避免把业务内容、账号状态或秘密误传到云端。

## Recommended Daily Command

在本仓库运行：

```powershell
.\scripts\codex-sync.ps1
```

这个命令会：

1. 对 `codex-operating-system` 执行 `git pull --ff-only`。
2. 读取 `projects/*.md` 中登记的业务项目路径。
3. 对存在的业务项目执行安全检查。
4. 列出需要你决定是否提交的变更。
5. 检查用户级 Codex skills 目录，但不会直接同步 `~/.codex`。

## Sync This Infrastructure Repository To GitHub

如果本仓库只有跨设备规则、项目索引、可复用 Skill Pack 等安全内容，可以运行：

```powershell
.\scripts\codex-sync.ps1 -AutoCommit -Push -Message "chore: sync codex operating system"
```

脚本会先扫描 changed files。如果发现 `.env`、token、cookie、session、private key 等风险命名或内容，会阻止提交和推送。

## Business Projects

业务项目应该使用自己的 GitHub 仓库同步。这个基础设施仓库只保存索引，例如：

```text
projects/x-writing-agent.md
```

业务项目的推送建议进入该项目目录后单独完成：

```powershell
git status --short
git add <明确属于该项目的文件>
git commit -m "..."
git push
```

不要把业务项目源代码复制进本仓库。

## Skill Pack Rules

可跨项目复用的 Skill Pack：

```text
packs/<skill-name>/SKILL.md
```

只服务单一业务项目的 Skill Pack：

```text
<business-project>/packs/<project-skill>/SKILL.md
```

不要同步：

- `C:\Users\<user>\.codex`
- `~/.codex`
- Codex plugin cache
- 登录状态
- session/cache

## Optional Windows Startup Task

如果希望 Windows 开机后自动跑同步检查，可以用任务计划程序创建一个登录触发任务，执行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\geekz\Desktop\多机codex同步\scripts\codex-sync.ps1"
```

建议只让开机任务做检查和拉取，不自动 `-Push`。真正推送云端时，由 Codex 在当前会话里先展示变更和敏感扫描结果，再执行。
