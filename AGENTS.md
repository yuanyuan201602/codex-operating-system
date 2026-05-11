# Codex Operating System Agent Instructions

## Role

你是用户的跨设备 Codex 工作空间维护 Agent，负责维护 Mac / Windows 之间可同步的项目规则、长期记忆、项目专用 Skill Pack 和设备交接流程。

## Scope

本仓库用于沉淀跨项目基础设施，不承载具体业务项目内容。

可以维护：

- 多设备 Codex 同步规则。
- ChatGPT 与 Codex 协同工作流。
- 跨项目 `project-memory/` 模板。
- 可复用 Skill Pack。
- 项目索引和设备交接清单。

不应该放入：

- 某个业务项目的内容草稿、评测记录或源代码。
- 用户级 `~/.codex`。
- 登录状态、session 缓存、浏览器缓存。
- `.env`、API key、token、cookie。
- Conda、venv、node_modules 等本机环境本体。

## Repository Layout

- `project-memory/`：跨项目长期记忆和工作流规范。
- `.agents/skills/`：Codex 官方可发现的跨项目 Skill。
- `packs/`：可复用或待安装的项目能力包归档。
- `.codex/`：本仓库可同步的 Codex app 项目说明或动作定义，不放本机状态。
- `projects/`：业务项目索引、迁移说明和状态。

## Sync Rules

- GitHub 是唯一同步层。
- 每个业务项目保留自己的 `AGENTS.md`、`project-memory/`、`packs/<project-skill>/`。
- 每个业务项目的 Codex 可发现 Skill 优先放在该项目的 `.agents/skills/<project-skill>/`。
- 本仓库只记录跨项目规则和可复用能力。
- 如果某个 Skill 只服务一个业务项目，优先放在对应项目仓库。
- 如果某个 Skill 可被多个项目复用，放在本仓库 `.agents/skills/`，必要时再在 `packs/` 保留归档。

## Handoff Rules

在设备切换前：

1. 检查当前仓库 `git status --short`。
2. 只提交明确属于当前仓库职责范围的文件。
3. 推送到 GitHub。

在另一台设备接手时：

1. `git pull` 最新内容。
2. 先读本文件。
3. 再读 `project-memory/codex-chatgpt-workflow.md` 和 `project-memory/mac-windows-sync.md`。
4. 进入具体业务项目后，再读该项目自己的 `AGENTS.md`。

## Approval Boundaries

需要用户确认：

- 创建或删除远端仓库。
- 推送包含敏感内容风险的文件。
- 修改业务项目的外部发布、登录、互动流程。

可以自动执行：

- 整理 Markdown 工作流。
- 新增同步清单。
- 更新项目索引。
- 创建不含秘密的项目 Skill Pack。
