# Mac Codex Handoff

你现在要接手我的跨设备 Codex 工作空间。先按下面步骤执行，不要急着开始业务任务。

## 1. 先拉取基础设施仓库

这是跨设备同步规则、长期记忆和通用 Skill Pack 的仓库：

```text
https://github.com/yuanyuan201602/codex-operating-system
```

在 Mac 上执行：

```bash
mkdir -p ~/Codex
cd ~/Codex
git clone https://github.com/yuanyuan201602/codex-operating-system.git
cd codex-operating-system
```

如果仓库已经存在：

```bash
cd ~/Codex/codex-operating-system
git pull origin main
```

然后按顺序读取：

1. `AGENTS.md`
2. `project-memory/codex-chatgpt-workflow.md`
3. `project-memory/mac-windows-sync.md`
4. `projects/x-writing-agent.md`

## 2. 再拉取 X 推文自动机项目

业务项目仓库：

```text
https://github.com/yuanyuan201602/x-writing-agent
```

建议放在：

```bash
mkdir -p ~/Codex/projects
cd ~/Codex/projects
git clone https://github.com/yuanyuan201602/x-writing-agent.git
cd x-writing-agent
```

如果仓库已经存在：

```bash
cd ~/Codex/projects/x-writing-agent
git pull origin main
```

然后按顺序读取：

1. `AGENTS.md`
2. `packs/x-writing-agent/SKILL.md`
3. `docs/superpowers/specs/2026-05-01-x-writing-agent-design.md`
4. `docs/superpowers/plans/2026-05-01-x-writing-agent-implementation.md`

## 3. 同步原则

可以通过 GitHub 同步：

- `AGENTS.md`
- `project-memory/`
- `packs/`
- `docs/`
- `templates/`
- `data/`
- `content/`
- 项目脚本和项目级配置

不要同步：

- `~/.codex`
- Codex 插件缓存
- 登录状态
- session 缓存
- 浏览器缓存
- Conda / venv / node_modules
- `.env`
- API key、token、cookie

## 4. 仓库边界

`codex-operating-system` 是基础设施仓库，放跨项目规则、多设备同步规则、通用 Skill Pack。

`x-writing-agent` 是业务项目仓库，只放 X 推文自动机相关内容，包括：

- prompt 候选池
- prompt 评测记录
- 每日审查包
- 短推草稿
- 长推草稿
- X 写作项目专用 Skill

不要把跨项目同步规范继续塞进 `x-writing-agent`。

## 5. 接手后先做检查

在两个仓库分别执行：

```bash
git status --short
git log -1 --oneline
```

确认当前分支是 `main`，并且没有未解释的本地改动。

## 6. 如果需要登录

只有这些情况需要用户介入登录：

- GitHub clone / pull / push 要认证
- 需要浏览器登录 ChatGPT / GPT 做测试
- 需要登录 X 准备草稿或账号操作

任何发布、点赞、评论、转发、关注、私信，都必须先问用户确认。

## 7. 接手后的第一件事

先不要做 X 自动化。

先跑一个 local-only 检查：

1. 确认 `x-writing-agent` 项目文件完整。
2. 确认 `packs/x-writing-agent/SKILL.md` 存在。
3. 确认 `templates/`、`data/`、`content/` 存在。
4. 汇报当前项目状态和下一步建议。
