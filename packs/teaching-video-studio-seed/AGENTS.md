# 教学视频定制台 Agent 指令

## 项目是什么

用 Codex 生成“代码式”教学视频的工程模板、检查脚本和 skill 包。引擎是 Remotion，首期只做本地单用户、横屏 1920×1080、30fps、静音加字幕的闭环。

## 必须遵守

1. **先文字，后代码。** 分镜（`storyboard.draft.json`）经用户确认（`approved: true`）之前，不得写任何镜头动画代码，也不得运行 `tvs scaffold`。
2. **镜头相互隔离。** 每个镜头只存在于 `lessons/<lessonId>/scenes/<sceneId>/`。镜头只能导入 `react`、`remotion`、`../../../../src/kit` 和本目录文件。
3. **时间用归一化进度。** 镜头内用 `useSceneT()` 和 `ramp()`，不要用绝对帧数，不要自己决定时长。时长只写在 `manifest.json`。
4. **颜色字体只来自风格 token。** 用 `useTheme()`，禁止硬编码颜色和 fontFamily。
5. **`src/kit/`、`src/theme/`、`scripts/` 对镜头任务只读。** 缺组件时报告缺口，不要在镜头里手搓一套。
6. **事实要有来源。** 事实写入 `facts.json`；自拟案例标 `teaching-illustration`，不得伪造真实调查、数据或人物经历。
7. **失败要如实报告。** 不得静默换案例、换风格、删除用户要求，也不得因为检查失败而去改检查脚本。
8. **MP4 只有 `tvs export` 通过校验后才算完成。** 预览成功不等于导出成功。
9. 不安装新依赖，不访问网络（研究阶段除外），不调用付费服务。

## 命令

```bash
npm run tvs -- check [lessonId]        # 契约 + 禁用写法 + 类型检查
npm run tvs -- scaffold <lessonId>     # 已确认的分镜 → 镜头目录
npm run tvs -- stills <lessonId>       # 关键帧，逐张查看
npm run tvs -- export <lessonId>       # 渲染并校验 MP4
npm run tvs -- edit begin|verify|accept|discard   # 受控的局部修改
npm run studio                         # Remotion Studio 预览
```

## 工作流与对应 skill

| 阶段 | skill | 产出 |
|---|---|---|
| 需求、研究、分镜 | `tvs-storyboard` | `brief.json`、`facts.json`、`storyboard.draft.json` |
| 逐镜头写动画 | `tvs-scene-writer` | `scenes/<id>/Scene.tsx` |
| 单镜头 / 时长 / 全局修改 | `tvs-scene-edit` | 候选版本 → verify → accept |

交付前读 `project-memory/` 里的两份文档，并按 `docs/storyboard-scorecard.md` 给分镜打分。
