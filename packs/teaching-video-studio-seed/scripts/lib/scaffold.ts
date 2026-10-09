import fs from "node:fs";
import path from "node:path";
import { BriefSchema, StoryboardDraftSchema, type Manifest } from "../../src/lib/schema";
import { lessonDir, listLessons, readJson, writeJson } from "./common";

const camel = (id: string) => id.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

export const writeLessonIndex = (root: string, lessonId: string, sceneIds: string[]): void => {
  const imports = sceneIds.map((id, i) => `import S${String(i + 1).padStart(2, "0")} from "./scenes/${id}/Scene";`);
  const entries = sceneIds.map((id, i) => `  "${id}": S${String(i + 1).padStart(2, "0")},`);
  fs.writeFileSync(
    path.join(lessonDir(root, lessonId), "index.ts"),
    `import type React from "react";
import { ManifestSchema } from "../../src/lib/schema";
import manifestJson from "./manifest.json";
${imports.join("\n")}

export const manifest = ManifestSchema.parse(manifestJson);

export const scenes: Record<string, React.FC> = {
${entries.join("\n")}
};
`,
  );
};

export const writeLessonsRegistry = (root: string): void => {
  const ids = listLessons(root).filter((id) => fs.existsSync(path.join(lessonDir(root, id), "index.ts")));
  const imports = ids.map((id) => `import * as ${camel(id)} from "./${id}";`);
  const entries = ids.map((id) => `  "${id}": ${camel(id)},`);
  fs.writeFileSync(
    path.join(root, "lessons", "index.ts"),
    `import type React from "react";
import type { Manifest } from "../src/lib/schema";
${imports.join("\n")}

export type LessonModule = { manifest: Manifest; scenes: Record<string, React.FC> };

export const lessons: Record<string, LessonModule> = {
${entries.join("\n")}
};
`,
  );
};

const stubScene = `import React from "react";
import { Caption, Heading, Stage, ramp, useSceneT } from "../../../../src/kit";
import spec from "./scene.json";

// 占位镜头：只显示分镜里的结论与字幕，等待逐镜头生成动画。
const Scene: React.FC = () => {
  const t = useSceneT();
  return (
    <Stage>
      <Heading title={spec.conclusion} progress={ramp(t, 0, 0.1)} top={360} />
      <Caption lines={spec.captions} />
    </Stage>
  );
};

export default Scene;
`;

/** 把用户确认过的 storyboard.draft.json 拆成 manifest、各镜头 scene.json 与占位 Scene.tsx。 */
export const scaffoldLesson = (root: string, lessonId: string): string[] => {
  const dir = lessonDir(root, lessonId);
  const draftFile = path.join(dir, "storyboard.draft.json");
  if (!fs.existsSync(draftFile)) throw new Error(`没有 ${path.relative(root, draftFile)}`);
  const draft = StoryboardDraftSchema.parse(readJson(draftFile));
  if (!draft.approved) throw new Error("分镜尚未确认：请审阅后把 approved 改为 true，确认之前不写任何动画代码");
  const brief = BriefSchema.parse(readJson(path.join(dir, "brief.json")));
  if (draft.lessonId !== lessonId || brief.lessonId !== lessonId) throw new Error("lessonId 与目录名不一致");

  const manifest: Manifest = {
    lessonId,
    style: brief.styleId,
    fps: 30,
    width: 1920,
    height: 1080,
    audio: { mode: "silent", durationSource: "visual" },
    scenes: draft.scenes.map((s) => ({ id: s.id, durationSec: s.durationSec })),
  };
  writeJson(path.join(dir, "manifest.json"), manifest);
  for (const { durationSec: _d, ...spec } of draft.scenes) {
    const sd = path.join(dir, "scenes", spec.id);
    fs.mkdirSync(sd, { recursive: true });
    writeJson(path.join(sd, "scene.json"), spec);
    const sceneFile = path.join(sd, "Scene.tsx");
    if (!fs.existsSync(sceneFile)) fs.writeFileSync(sceneFile, stubScene);
  }
  writeLessonIndex(root, lessonId, manifest.scenes.map((s) => s.id));
  writeLessonsRegistry(root);
  writeJson(path.join(dir, "storyboard.json"), {
    lessonId,
    approved: true,
    coreConcept: draft.coreConcept,
    closingQuestion: draft.closingQuestion,
  });
  fs.rmSync(draftFile);
  return manifest.scenes.map((s) => s.id);
};
