import fs from "node:fs";
import path from "node:path";
import {
  BriefSchema,
  FactsSchema,
  ManifestSchema,
  SceneSpecSchema,
  StoryboardSchema,
  type Manifest,
  type SceneSpec,
} from "../../src/lib/schema";
import { lessonDir, readJson, type Issue } from "./common";

const MAX_CPS = 7;
const MAX_LINE_CHARS = 28;

const zodIssues = (where: string, err: { issues: { path: (string | number)[]; message: string }[] }): Issue[] =>
  err.issues.map((i) => ({ level: "error", where, message: `${i.path.join(".") || "(根)"}: ${i.message}` }));

export const loadSceneSpecs = (root: string, lessonId: string, manifest: Manifest): Map<string, SceneSpec> => {
  const out = new Map<string, SceneSpec>();
  for (const s of manifest.scenes) {
    const file = path.join(lessonDir(root, lessonId), "scenes", s.id, "scene.json");
    if (!fs.existsSync(file)) continue;
    const parsed = SceneSpecSchema.safeParse(readJson(file));
    if (parsed.success) out.set(s.id, parsed.data);
  }
  return out;
};

/** 供界面和人工审阅使用的完整分镜视图（由各镜头 scene.json 与 manifest 现场拼出，不入库）。 */
export const storyboardView = (root: string, lessonId: string, manifest: Manifest) => {
  const specs = loadSceneSpecs(root, lessonId, manifest);
  return manifest.scenes.map((s) => ({ ...specs.get(s.id), durationSec: s.durationSec }));
};

/** 课程级契约校验：schema、镜头目录、事实引用、字幕节奏、分镜与镜头一致性。 */
export const validateLesson = (root: string, lessonId: string): Issue[] => {
  const issues: Issue[] = [];
  const dir = lessonDir(root, lessonId);
  const need = (f: string) => fs.existsSync(path.join(dir, f));

  for (const f of ["brief.json", "facts.json", "manifest.json", "storyboard.json", "index.ts"]) {
    if (!need(f)) issues.push({ level: "error", where: lessonId, message: `缺少 ${f}` });
  }
  if (issues.length) return issues;

  const brief = BriefSchema.safeParse(readJson(path.join(dir, "brief.json")));
  if (!brief.success) issues.push(...zodIssues("brief.json", brief.error));
  else if (brief.data.lessonId !== lessonId) issues.push({ level: "error", where: "brief.json", message: "lessonId 与目录名不一致" });

  const facts = FactsSchema.safeParse(readJson(path.join(dir, "facts.json")));
  if (!facts.success) issues.push(...zodIssues("facts.json", facts.error));
  else {
    for (const f of facts.data.facts) {
      if (f.kind === "verified" && (!f.source || !f.verifiedOn)) {
        issues.push({ level: "error", where: `facts.json#${f.id}`, message: "verified 事实必须有 source 和 verifiedOn" });
      }
    }
  }

  const manifestParsed = ManifestSchema.safeParse(readJson(path.join(dir, "manifest.json")));
  if (!manifestParsed.success) {
    issues.push(...zodIssues("manifest.json", manifestParsed.error));
    return issues;
  }
  const manifest = manifestParsed.data;
  if (manifest.lessonId !== lessonId) issues.push({ level: "error", where: "manifest.json", message: "lessonId 与目录名不一致" });
  if (manifest.audio.mode === "silent" && manifest.audio.durationSource !== "visual") {
    issues.push({ level: "error", where: "manifest.json", message: "静音模式的时长来源必须是 visual" });
  }
  const ids = manifest.scenes.map((s) => s.id);
  if (new Set(ids).size !== ids.length) issues.push({ level: "error", where: "manifest.json", message: "镜头 id 重复" });

  const sceneRoot = path.join(dir, "scenes");
  const onDisk = fs.existsSync(sceneRoot) ? fs.readdirSync(sceneRoot) : [];
  for (const d of onDisk) {
    if (!ids.includes(d)) issues.push({ level: "error", where: `scenes/${d}`, message: "目录存在但 manifest 中没有这个镜头" });
  }

  const indexSrc = fs.readFileSync(path.join(dir, "index.ts"), "utf8");
  const factIds = new Set(facts.success ? facts.data.facts.map((f) => f.id) : []);

  for (const s of manifest.scenes) {
    const sd = path.join(sceneRoot, s.id);
    if (!fs.existsSync(path.join(sd, "Scene.tsx"))) {
      issues.push({ level: "error", where: s.id, message: "缺少 Scene.tsx" });
      continue;
    }
    if (!fs.existsSync(path.join(sd, "scene.json"))) {
      issues.push({ level: "error", where: s.id, message: "缺少 scene.json" });
      continue;
    }
    if (!indexSrc.includes(`"${s.id}"`) && !indexSrc.includes(`scenes/${s.id}/`)) {
      issues.push({ level: "error", where: s.id, message: "没有在课程 index.ts 中注册" });
    }
    const spec = SceneSpecSchema.safeParse(readJson(path.join(sd, "scene.json")));
    if (!spec.success) {
      issues.push(...zodIssues(`${s.id}/scene.json`, spec.error));
      continue;
    }
    if (spec.data.id !== s.id) issues.push({ level: "error", where: `${s.id}/scene.json`, message: "id 与目录名不一致" });
    for (const ref of spec.data.factRefs) {
      if (!factIds.has(ref)) issues.push({ level: "error", where: `${s.id}/scene.json`, message: `引用了不存在的事实 ${ref}` });
    }
    let prevTo = 0;
    for (const [i, c] of spec.data.captions.entries()) {
      const where = `${s.id}/scene.json#captions[${i}]`;
      if (c.to <= c.from) issues.push({ level: "error", where, message: "to 必须大于 from" });
      if (c.from < prevTo) issues.push({ level: "error", where, message: "字幕时间重叠或乱序" });
      prevTo = c.to;
      if (c.text.length > MAX_LINE_CHARS) {
        issues.push({ level: "error", where, message: `单条字幕 ${c.text.length} 字，超过 ${MAX_LINE_CHARS} 字上限（会换行溢出）` });
      }
      const seconds = (c.to - c.from) * s.durationSec;
      const cps = c.text.length / Math.max(seconds, 0.01);
      if (cps > MAX_CPS) {
        issues.push({ level: "error", where, message: `字幕停留 ${seconds.toFixed(1)} 秒显示 ${c.text.length} 字（${cps.toFixed(1)} 字/秒），超过 ${MAX_CPS} 字/秒，学生来不及读` });
      }
    }
  }

  const sbParsed = StoryboardSchema.safeParse(readJson(path.join(dir, "storyboard.json")));
  if (!sbParsed.success) issues.push(...zodIssues("storyboard.json", sbParsed.error));
  else if (!sbParsed.data.approved) {
    issues.push({ level: "error", where: "storyboard.json", message: "分镜未经确认（approved=false）就已存在镜头代码" });
  }
  return issues;
};
