---
name: tvs-scene-writer
description: 分镜已确认后，逐个镜头用教学组件库写 Remotion 场景代码，并跑检查与关键帧复核。仅在 storyboard approved=true 之后使用。
---

# 逐镜头写动画

前提：`storyboard.draft.json` 已 `approved: true`。先运行 `npm run tvs -- scaffold <lessonId>`，它会生成 `manifest.json`、各镜头的 `scene.json` 和占位 `Scene.tsx`，并更新 `index.ts`。

## 一次只写一个镜头

每个镜头单独一轮。只允许写 `lessons/<lessonId>/scenes/<sceneId>/Scene.tsx`（需要时可调整该目录的 `scene.json`）。不得改 `manifest.json`、其他镜头、`src/`、`scripts/`。

## 写法契约

```tsx
import React from "react";
import { Caption, Heading, Stage, ramp, useSceneT } from "../../../../src/kit";
import spec from "./scene.json";

const Scene: React.FC = () => {
  const t = useSceneT();                    // 0..1，镜头内归一化进度
  return (
    <Stage>
      <Heading title="…" progress={ramp(t, 0, 0.1)} />
      <Caption lines={spec.captions} />       // 字幕必须来自 scene.json
    </Stage>
  );
};
export default Scene;
```

- 画布 1920×1080，左右边距 96，字幕条占底部 928–1024，**内容不得进入这一区域**。
- 用 `ramp(t, 开始, 结束)` 安排出现、移动、高亮；开始/结束都是 0–1。这样改 `durationSec` 就能整体放慢，不需要改代码。
- 颜色只通过 `useTheme()` 取；不要写 `#fff`、`rgb()`、`fontFamily`。
- 不用 `useCurrentFrame`、随机数、`Date`、网络。
- 位置放在镜头文件顶部的常量里，节点和连线用组件，不手写 SVG 坐标计算。

## 组件库（`src/kit`，只读）

| 组件 | 用途 |
|---|---|
| `Stage` | 背景与字体，所有镜头的根 |
| `Heading` | 标题 + 副标题，`progress` 控制出现 |
| `Caption` | 字幕条，吃 `scene.json` 的 captions |
| `FlowNode` | 单个节点（question / answer / plain），`progress`、`active` |
| `Connector` | 竖-横-竖折线连线，带“是/否”标注 |
| `TreeDiagram` | 判断树 / 流程树，节点与边的出现和高亮由场景传入 |
| `Panel` | 带标题的文字卡片 |
| `Pointer` | 沿路径移动的小圆点 |
| `ramp` / `lerp` / `useSceneT` | 动画工具 |

组件不够用时：**停下来报告缺口**（需要什么组件、哪个镜头要用），不要在镜头里手搓同类组件，也不要改 `src/kit`。

## 每个镜头写完后

1. `npm run tvs -- check <lessonId>`，必须通过。
2. `npm run tvs -- stills <lessonId>`，**逐张打开关键帧看**：文字是否被裁切、是否进入字幕区、元素是否互相遮挡、是否和 `scene.json` 的 `beats` 对得上。这一步发现过真实问题（文字被裁切、小圆点盖住文字），不能省。
3. 画面有问题就修，不要放宽检查。
4. 全部镜头完成后 `npm run tvs -- export <lessonId>`，导出校验通过才能说视频完成。
