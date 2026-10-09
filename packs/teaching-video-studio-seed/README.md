# 教学视频定制台

用真实 Codex 生成“代码式”教学视频：给知识点和年级，先出文字分镜并由教师确认，再逐镜头写 Remotion 动画，之后可对具体镜头做受控的局部修改，最后导出经过校验的 MP4。

首期边界：本地单用户、横屏 1920×1080 / 30fps、静音加字幕、Remotion 单引擎。网页界面最后再做，见 `project-memory/design-decisions.md`。

## 三层结构

| 层 | 位置 | 说明 |
|---|---|---|
| 工程模板 | `src/`、`lessons/` | 教学组件库 `src/kit`、风格 token `src/theme`、课程与镜头 |
| Skill 包 | `.agents/skills/` | `tvs-storyboard`、`tvs-scene-writer`、`tvs-scene-edit` |
| 编排与检查 | `scripts/` | `tvs` 命令：校验、扫描、关键帧、导出、局改 |

## 快速开始

```bash
npm install
npm run tvs -- check                 # 校验示范课
npm run studio                       # 打开 Remotion Studio 预览
npm run tvs -- stills decision-tree-weekend
npm run tvs -- export decision-tree-weekend   # out/decision-tree-weekend/*.mp4
```

示范课 `lessons/decision-tree-weekend`：小学五年级“判断树：周末出行”，4 个镜头，手写，用来验证组件库、检查脚本和导出链路，**不是**模型生成能力的证明。

## 一节课的目录

```text
lessons/<lessonId>/
  brief.json               需求、教学目标、易错点、不可改内容
  facts.json               事实与来源；自拟案例标 teaching-illustration
  storyboard.json          分镜确认记录（approved）
  manifest.json            镜头顺序与时长（时长的唯一来源）
  index.ts                 镜头注册（scaffold 生成）
  scenes/<sceneId>/
    scene.json             该镜头的目的、结论、字幕、节拍（镜头内容的唯一来源）
    Scene.tsx              只用 src/kit 组件写成的动画
```

## 为什么局部修改是可控的

- 镜头相互隔离，时间用 0–1 归一化进度，时长只在 manifest 里；改某镜头时长不需要动任何镜头代码。
- 修改在独立 git worktree 里进行；`edit verify` 做路径白名单、静态检查、关键帧像素回归；通过才 `edit accept` 合并，失败直接丢弃。
- 版本就是 git 提交，回退就是 `git revert`。

## 当前状态

已实现并验证（见 `project-memory/verification-log.md`）：组件库与两套风格 token、契约校验、禁用写法扫描、关键帧截取、带 ffprobe 校验的 MP4 导出、`scaffold`、受控局改流程及其 7 种失败情形、3 个 skill 与分镜评分表。

未实现：用 Codex 真实生成的端到端运行（需要在目标 Mac 上登录 Codex 后验证）、中文配音、网页界面、字幕溢出的自动像素检测。
