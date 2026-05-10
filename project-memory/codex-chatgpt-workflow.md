# Codex + ChatGPT 协同工作流

Version: 0.1.0  
Updated: 2026-05-10

## 目标

建立一个跨 Mac 与 Windows PC 的统一 AI Agent 工作环境，实现：

- 项目代码同步
- Codex 项目配置同步
- Skill 能力包同步
- 项目长期记忆同步
- ChatGPT 与 Codex 的协同工作
- 多设备无缝切换开发

核心目标不是“同步聊天记录”，而是建立一个可持续积累的 Agent 工程系统。

## 核心架构

```text
ChatGPT
  ↓
project-memory/
  ↓
GitHub
  ↓
Codex
```

| 层级 | 作用 |
| --- | --- |
| ChatGPT | 战略讨论、架构设计、方法论形成 |
| project-memory | 长期上下文与项目认知 |
| GitHub | 同步层与版本控制 |
| Codex | 工程执行与代码实现 |

## 统一目录结构

Mac：

```text
~/Codex/
```

Windows：

```text
D:\Codex\
```

建议结构：

```text
Codex/
├── projects/
├── packs/
└── workspace/
```

## 项目标准结构

```text
project-name/
├── .git/
├── .codex/
│   └── config.toml
├── AGENTS.md
├── README.md
├── project-memory/
│   ├── architecture.md
│   ├── roadmap.md
│   ├── design-decisions.md
│   ├── workflow.md
│   ├── mistakes.md
│   ├── prompts.md
│   └── session-log/
├── packs/
├── prompts/
├── docs/
├── src/
└── tests/
```

## AGENTS.md 的作用

`AGENTS.md` 是 Codex 的核心项目规则文件，用于：

- 描述项目目标
- 描述技术栈
- 约束代码风格
- 约束工作流
- 约束 memory 更新机制

## Codex 配置

项目级配置文件可放在：

```text
.codex/config.toml
```

项目配置可以跟随 GitHub 同步。不要同步用户级 `~/.codex`。

## Skill 能力包系统

建立 `packs/` 作为长期能力资产库。有效工作流应沉淀为 `SKILL.md`、`workflow.md`、`templates/`、`prompts/`、`schemas/`。

Memory 是临时上下文，Skill 才是长期能力资产。

## ChatGPT 与 Codex 的关系

ChatGPT 负责：

- 产品设计
- 架构设计
- 工作流设计
- Prompt 设计
- 方法论形成
- 复杂问题讨论

Codex 负责：

- 写代码
- 修改项目
- 调试
- 更新文档
- 执行 workflow

两者通过 `project-memory/` 共享项目认知。

## 正确工作流

1. 在 ChatGPT 讨论架构、方案、workflow、技术路线。
2. 让 ChatGPT 输出 `project-memory/` 文档，例如 `architecture.md`、`roadmap.md`、`workflow.md`、`next-steps.md`。
3. 提交 GitHub：

```bash
git add .
git commit -m "docs: update project memory"
git push
```

4. 另一台机器执行 `git pull`。
5. 启动 Codex。
6. Codex 读取 `AGENTS.md`、`project-memory/`、`packs/`、`.codex/config.toml` 并继续执行。

开发完成后，Codex 应根据实际变更更新 `design-decisions.md`、`roadmap.md`、`mistakes.md`、`workflow.md`，再由用户决定是否提交和推送。

## 长期记忆机制

真正可靠的长期记忆不是聊天记录，而是 `project-memory/`。

每次重要开发完成后应更新：

- `design-decisions.md`
- `roadmap.md`
- `mistakes.md`
- `workflow.md`

## 禁止事项

不要：

- 同步 `~/.codex`
- 同步 Conda 环境本体
- 同步 session 缓存
- 同步 AI 登录状态
- 用 OneDrive/iCloud 同步项目目录

GitHub 才是同步层。

## 最终目标

最终目标不是“让 AI 帮忙写代码”，而是建立 Agent Operating System：

- ChatGPT 负责认知
- Codex 负责执行
- GitHub 负责同步
- `project-memory/` 负责长期上下文
- Skill Pack 负责能力积累
