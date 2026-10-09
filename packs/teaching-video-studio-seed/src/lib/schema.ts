import { z } from "zod";

export const CATEGORIES = ["principle", "process", "comparison"] as const;

export const BriefSchema = z.object({
  lessonId: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(CATEGORIES),
  styleId: z.string(),
  knowledgePoint: z.string().min(1),
  grade: z.string().min(1),
  emphasis: z.string().optional(),
  assets: z.array(z.string()).default([]),
  teachingGoal: z.string().min(1),
  prerequisites: z.array(z.string()),
  misconceptions: z.array(z.string()),
  locked: z.array(z.string()).default([]),
  analogyBoundary: z.string().optional(),
});
export type Brief = z.infer<typeof BriefSchema>;

export const FactsSchema = z.object({
  facts: z.array(
    z.object({
      id: z.string().regex(/^f\d+$/),
      statement: z.string(),
      kind: z.enum(["verified", "teaching-illustration"]),
      source: z.string().optional(),
      verifiedOn: z.string().optional(),
    }),
  ),
});
export type Facts = z.infer<typeof FactsSchema>;

const SceneIdSchema = z.string().regex(/^s\d{2}-[a-z0-9-]+$/);

export const ManifestSchema = z.object({
  lessonId: z.string(),
  style: z.string(),
  fps: z.literal(30),
  width: z.literal(1920),
  height: z.literal(1080),
  audio: z.object({
    mode: z.enum(["silent", "imported", "tts"]),
    durationSource: z.enum(["visual", "narration"]),
  }),
  scenes: z
    .array(
      z.object({
        id: SceneIdSchema,
        durationSec: z.number().min(3).max(60),
      }),
    )
    .min(1),
});
export type Manifest = z.infer<typeof ManifestSchema>;

export const CaptionLineSchema = z.object({
  from: z.number().min(0).max(1),
  to: z.number().min(0).max(1),
  text: z.string().min(1),
});
export type CaptionLine = z.infer<typeof CaptionLineSchema>;

export const SceneSpecSchema = z.object({
  id: SceneIdSchema,
  purpose: z.string().min(1),
  conclusion: z.string().min(1),
  captions: z.array(CaptionLineSchema).min(1),
  objects: z.array(z.string()).min(1),
  beats: z.array(z.string()).min(1),
  factRefs: z.array(z.string()).default([]),
});
export type SceneSpec = z.infer<typeof SceneSpecSchema>;

/** 提交到仓库的分镜审批记录；各镜头内容的唯一数据源是各自的 scene.json。 */
export const StoryboardSchema = z.object({
  lessonId: z.string(),
  approved: z.boolean(),
  coreConcept: z.string().min(1),
  closingQuestion: z.string().min(1),
});
export type Storyboard = z.infer<typeof StoryboardSchema>;

/** 分镜阶段产物：用户确认前只有文字，没有任何动画代码。 */
export const StoryboardDraftSchema = StoryboardSchema.extend({
  scenes: z.array(SceneSpecSchema.extend({ durationSec: z.number().min(3).max(60) })).min(1),
});
export type StoryboardDraft = z.infer<typeof StoryboardDraftSchema>;

export const EditPlanSchema = z.object({
  lessonId: z.string(),
  request: z.string(),
  kind: z.enum(["scene", "duration", "global"]),
  targetSceneIds: z.array(z.string()).min(1),
  allowedPaths: z.array(z.string()).min(1),
  confirmedGlobal: z.boolean().default(false),
});
export type EditPlan = z.infer<typeof EditPlanSchema>;
