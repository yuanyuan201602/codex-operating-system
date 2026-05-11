# Mac Codex Handoff

你现在要在 Mac 上接手跨设备 Codex 工作空间。先按下面步骤检查，不要急着开始业务任务。

## 1. 拉取基础设施仓库

这个仓库只保存跨设备规则、长期记忆、项目索引和通用 Skill Pack：

```text
https://github.com/yuanyuan201602/codex-operating-system
```

建议路径：

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
4. `projects/`

## 2. 再拉取业务项目

业务项目不会自动出现在这个仓库里。先打开 `projects/` 里的项目索引，找到对应项目的 GitHub URL，再单独 clone 或 pull。

以 `x-writing-agent` 为例：

```text
https://github.com/yuanyuan201602/x-writing-agent
```

建议路径：

```bash
mkdir -p ~/Codex/projects
cd ~/Codex/projects
git clone https://github.com/yuanyuan201602/x-writing-agent.git
cd x-writing-agent
```

如果项目已经存在：

```bash
cd ~/Codex/projects/x-writing-agent
git pull origin main
```

进入业务项目后，再读该项目自己的：

1. `AGENTS.md`
2. `project-memory/`
3. `packs/`
4. `docs/`

## 3. 同步边界

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

## 4. 接手后先做检查

在基础设施仓库和业务项目仓库分别执行：

```bash
git status --short
git log -1 --oneline
```

确认当前分支、最新提交和未提交改动，再开始业务任务。

## 5. 如果项目没显示

通常不是 Codex 没同步，而是这个项目还没有完成其中一步：

1. 项目本身还没有推送到 GitHub。
2. 本基础设施仓库的 `projects/` 里还没有项目索引。
3. 添加索引后没有 commit 和 push。
4. 另一台设备只 pull 了基础设施仓库，没有 clone 或 pull 业务项目仓库。
