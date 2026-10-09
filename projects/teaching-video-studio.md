# Teaching Video Studio（教学视频定制台）

Repository URL: 尚未创建。创建独立仓库后，在本文件加一行以 "Repository:" 开头、仓库地址用反引号包起来的记录，同步脚本才会自动克隆它。

Recommended Mac path:

```text
~/Desktop/teaching-video-studio
```

Recommended Windows path:

```text
%USERPROFILE%\Desktop\teaching-video-studio
```

Purpose:

- 用 Codex 生成代码式（Remotion）教学视频：先出文字分镜并由教师确认，再逐镜头写动画，支持受控的单镜头修改，导出经过校验的 MP4。

Current status (2026-10-09):

- 工程模板、教学组件库、检查脚本、局部修改流程、3 个 skill、分镜评分表已完成，并在云端 VM 上验证（见项目内 `project-memory/verification-log.md`）。
- 尚未在 Mac 上运行，尚未用 Codex 真实生成过镜头。
- 源码快照暂存于本仓库 `packs/teaching-video-studio-seed/`，用其中的 `install-to-desktop.sh` / `install-to-desktop.ps1` 落地到桌面。
- 独立 GitHub 仓库尚未创建，需要用户确认后创建。

Project-owned files:

- `AGENTS.md`
- `project-memory/`
- `.agents/skills/tvs-storyboard`、`tvs-scene-writer`、`tvs-scene-edit`
- `src/`、`lessons/`、`scripts/`、`docs/`

Must stay local:

- `node_modules/`、`out/`（渲染产物）、`.worktrees/`、`.tvs/`、`.env`。

Boundary:

- 跨项目同步规则留在 `codex-operating-system`；视频工程、skill 和课程内容属于 `teaching-video-studio` 仓库。
