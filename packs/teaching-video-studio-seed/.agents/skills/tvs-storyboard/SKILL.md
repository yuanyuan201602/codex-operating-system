---
name: tvs-storyboard
description: 为教学视频定制台把知识点和年级转成 brief、事实清单与文字分镜（storyboard.draft.json）。在用户给出知识点、需要案例研究或分镜时使用；分镜确认之前不写任何动画代码。
---

# 需求、研究与分镜

目标：产出一份教师能在 5 分钟内审完、且讲得准确、适龄的**纯文字**分镜。动画代码在分镜确认之后才写。

## 输入

必填：知识点、学生年级。可选：强调内容、生活例子、素材、类别（principle 原理讲解 / process 过程演示 / comparison 对比辨析）、风格 id（见 `src/theme/tokens.ts`）。用户给的重点、案例和素材是约束，不得替换。缺少必填项时只问这一个最小问题。

## 步骤

1. **写 `lessons/<lessonId>/brief.json`**（格式见 `src/lib/schema.ts` 的 `BriefSchema`）。`lessonId` 用小写英文和连字符。必须写清：
   - `teachingGoal`：看完能复述的一句话。
   - `prerequisites`：学生必须已经会的东西，不能依赖未讲过的概念。
   - `misconceptions`：这个知识点最常见的误解。
   - `locked`：用户明确不许改的内容。
   - `analogyBoundary`：类比说明什么、**不**说明什么。
2. **写 `facts.json`**。事实类标 `verified`，必须有 `source` 和 `verifiedOn`；自拟案例标 `teaching-illustration`。来源冲突时保留冲突并问用户，不要挑一个顺口的。数学类要检查：变换是否保持本应不变的面积、长度或身份；近似结论不能写成精确等式。
3. **写 `storyboard.draft.json`**（`StoryboardDraftSchema`），`approved` 先写 `false`。每个镜头必须有：
   - `id`：`sNN-短名`，一旦确定就不再改；
   - `purpose`：这个镜头要让学生看懂什么；
   - `conclusion`：学生看完该得出的一句话；
   - `captions`：字幕，`from/to` 是镜头内 0–1 的相对位置；
   - `objects` / `beats`：画面对象和节拍；
   - `factRefs`；`durationSec`。
4. **自检再交付**，按 `docs/storyboard-scorecard.md` 逐项打分并附在回复里，不达标的项先改再交。

## 教学规则

- 一个视频只讲一个核心概念；一个镜头只有一个可观察变化。
- 先确定学生已知什么，再引入新概念；新术语出现时当场解释。
- 结论必须能从画面展示的过程推出来，不能只靠旁白宣布。
- 字幕：每条不超过 28 字，停留时长要满足 7 字/秒以内（`tvs check` 会拦）；小学中高年级建议 ≤5 字/秒。
- 结尾用一句可复述的原理或一个迁移问题，不重复片名。
- 生活类比写清映射和边界，不扩成别的概念（例：路线选择讲条件分支，不扩成机器学习训练）。
- 镜头数通常 3–6 个，总长默认约 60 秒，可调。

## 交付

回复里给出：分镜摘要（逐镜头的 purpose / conclusion / 字幕）、事实与示意的区分、打分表、需要用户拍板的问题。**请用户确认**：确认后把 `approved` 改为 `true`，再进入 `tvs-scene-writer`。
