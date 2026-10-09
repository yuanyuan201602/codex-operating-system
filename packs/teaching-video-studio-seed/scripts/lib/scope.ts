import fs from "node:fs";
import path from "node:path";
import { EditPlanSchema, ManifestSchema, type EditPlan } from "../../src/lib/schema";
import { git, type Issue } from "./common";

/** 路径白名单：以 / 结尾表示目录前缀，否则必须精确匹配。 */
export const allowed = (file: string, allowedPaths: string[]): boolean =>
  allowedPaths.some((p) => (p.endsWith("/") ? file.startsWith(p) : file === p));

/** 变更计划自身是否合法：范围必须与修改类型匹配。 */
export const checkPlan = (raw: unknown): { plan?: EditPlan; issues: Issue[] } => {
  const parsed = EditPlanSchema.safeParse(raw);
  if (!parsed.success) {
    return { issues: parsed.error.issues.map((i) => ({ level: "error", where: "plan", message: `${i.path.join(".")}: ${i.message}` })) };
  }
  const plan = parsed.data;
  const issues: Issue[] = [];
  const base = `lessons/${plan.lessonId}/`;
  if (plan.kind === "scene") {
    const expect = plan.targetSceneIds.map((id) => `${base}scenes/${id}/`);
    for (const p of plan.allowedPaths) {
      if (!expect.includes(p)) issues.push({ level: "error", where: "plan", message: `镜头内修改只允许 ${expect.join("、")}，计划里多了 ${p}` });
    }
  } else if (plan.kind === "duration") {
    if (plan.allowedPaths.length !== 1 || plan.allowedPaths[0] !== `${base}manifest.json`) {
      issues.push({ level: "error", where: "plan", message: `时长修改只允许改 ${base}manifest.json` });
    }
  } else if (!plan.confirmedGlobal) {
    issues.push({ level: "error", where: "plan", message: "全局修改会影响多个镜头，必须先由用户确认（confirmedGlobal=true）" });
  }
  return { plan, issues };
};

export const changedFiles = (cwd: string, baseRev: string): string[] => {
  const tracked = git(cwd, ["diff", "--name-only", baseRev]).split("\n");
  const untracked = git(cwd, ["ls-files", "--others", "--exclude-standard"]).split("\n");
  return [...new Set([...tracked, ...untracked])].filter(Boolean);
};

export const checkScope = (cwd: string, baseRev: string, plan: EditPlan): Issue[] => {
  const issues: Issue[] = [];
  const files = changedFiles(cwd, baseRev);
  if (files.length === 0) issues.push({ level: "error", where: "scope", message: "没有任何改动" });
  for (const f of files) {
    if (!allowed(f, plan.allowedPaths)) issues.push({ level: "error", where: "scope", message: `越界修改了 ${f}（不在允许范围内）` });
  }
  if (plan.kind === "duration" && files.includes(`lessons/${plan.lessonId}/manifest.json`)) {
    const rel = `lessons/${plan.lessonId}/manifest.json`;
    const before = ManifestSchema.parse(JSON.parse(git(cwd, ["show", `${baseRev}:${rel}`])));
    const after = ManifestSchema.parse(JSON.parse(fs.readFileSync(path.join(cwd, rel), "utf8")));
    const strip = (m: typeof before) => ({ ...m, scenes: m.scenes.map((s) => ({ id: s.id, d: plan.targetSceneIds.includes(s.id) ? 0 : s.durationSec })) });
    if (JSON.stringify(strip(before)) !== JSON.stringify(strip(after))) {
      issues.push({ level: "error", where: "scope", message: "时长修改只能改目标镜头的 durationSec，manifest 其他内容发生了变化" });
    }
  }
  return issues;
};
