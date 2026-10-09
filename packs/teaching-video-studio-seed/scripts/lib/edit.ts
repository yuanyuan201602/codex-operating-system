import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { EditPlan } from "../../src/lib/schema";
import { git, readJson, report, run, writeJson, type Issue } from "./common";
import { compareStills, renderStills } from "./render";
import { changedFiles, checkPlan, checkScope } from "./scope";
import { lintScenes } from "./lint";
import { validateLesson } from "./validate";

type StoredPlan = EditPlan & { baseRev: string; branch: string };

const planFile = (wt: string) => path.join(wt, ".tvs", "plan.json");
const verifiedFile = (wt: string) => path.join(wt, ".tvs", "verified.json");

const requireCleanMain = (root: string, baseRev?: string) => {
  if (git(root, ["status", "--porcelain"])) throw new Error("主工作区有未提交改动，请先提交或还原");
  const head = git(root, ["rev-parse", "HEAD"]);
  if (baseRev && head !== baseRev) throw new Error(`请求已过期：基准版本 ${baseRev.slice(0, 7)}，当前最新 ${head.slice(0, 7)}。请重新发起修改`);
  return head;
};

const fingerprint = (wt: string, baseRev: string): string => {
  const h = crypto.createHash("sha256");
  for (const f of changedFiles(wt, baseRev).sort()) {
    h.update(f);
    const p = path.join(wt, f);
    h.update(fs.existsSync(p) ? fs.readFileSync(p) : "deleted");
  }
  return h.digest("hex");
};

const allowedPathsFor = (lessonId: string, kind: EditPlan["kind"], sceneIds: string[]): string[] => {
  const base = `lessons/${lessonId}/`;
  if (kind === "scene") return sceneIds.map((id) => `${base}scenes/${id}/`);
  if (kind === "duration") return [`${base}manifest.json`];
  return [base];
};

export const editBegin = (
  root: string,
  opts: { lessonId: string; kind: EditPlan["kind"]; sceneIds: string[]; request: string; confirmedGlobal: boolean },
): string => {
  const baseRev = requireCleanMain(root);
  const plan: EditPlan = {
    lessonId: opts.lessonId,
    request: opts.request,
    kind: opts.kind,
    targetSceneIds: opts.sceneIds,
    allowedPaths: allowedPathsFor(opts.lessonId, opts.kind, opts.sceneIds),
    confirmedGlobal: opts.confirmedGlobal,
  };
  const checked = checkPlan(plan);
  if (checked.issues.length) {
    report("变更计划", checked.issues);
    throw new Error("变更计划不合法");
  }
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const branch = `edit/${stamp}`;
  const wt = path.join(root, ".worktrees", `edit-${stamp}`);
  git(root, ["worktree", "add", "-q", "-b", branch, wt, baseRev]);
  fs.symlinkSync(path.join(root, "node_modules"), path.join(wt, "node_modules"));
  writeJson(planFile(wt), { ...plan, baseRev, branch } satisfies StoredPlan);
  return wt;
};

export const editVerify = async (root: string, wt: string): Promise<boolean> => {
  const plan = readJson<StoredPlan>(planFile(wt));
  const issues: Issue[] = [];
  issues.push(...checkPlan(plan).issues, ...checkScope(wt, plan.baseRev, plan));

  issues.push(...validateLesson(wt, plan.lessonId));
  issues.push(...lintScenes(wt, plan.lessonId));
  const tsc = run(wt, path.join(wt, "node_modules", ".bin", "tsc"), ["--noEmit"]);
  if (!tsc.ok) issues.push({ level: "error", where: "tsc", message: tsc.output.split("\n").slice(0, 8).join(" | ") });

  let ok = report("范围与静态检查", issues);
  if (!ok) return false;

  requireCleanMain(root, plan.baseRev);
  const baseDir = path.join(root, "out", plan.lessonId, "stills", `base-${plan.baseRev.slice(0, 7)}`);
  const baseHashFile = path.join(baseDir, "hashes.json");
  const baseHashes = fs.existsSync(baseHashFile)
    ? readJson<Record<string, string>>(baseHashFile)
    : await renderStills(root, plan.lessonId, baseDir);
  const newHashes = await renderStills(wt, plan.lessonId, path.join(wt, "out", plan.lessonId, "stills", "new"));

  const manifest = readJson<{ scenes: { id: string }[] }>(path.join(wt, "lessons", plan.lessonId, "manifest.json"));
  const untouched = manifest.scenes.map((s) => s.id).filter((id) => !plan.targetSceneIds.includes(id));
  const regress: Issue[] = [];
  if (plan.kind !== "global") {
    for (const name of compareStills(baseHashes, newHashes, untouched)) {
      regress.push({ level: "error", where: "回归", message: `未选中的镜头画面发生变化: ${name}` });
    }
  } else {
    regress.push({ level: "warn", where: "回归", message: "全局修改已由用户确认，跳过未选中镜头的像素回归" });
  }
  const targetChanged = Object.keys(baseHashes).filter((n) => plan.targetSceneIds.includes(n.split("@")[0]) && baseHashes[n] !== newHashes[n]);
  if (plan.kind !== "duration" && targetChanged.length === 0) {
    regress.push({ level: "error", where: "回归", message: "目标镜头的关键帧没有任何变化，修改未生效" });
  }
  ok = report("关键帧回归", regress);
  if (ok) writeJson(verifiedFile(wt), { baseRev: plan.baseRev, fingerprint: fingerprint(wt, plan.baseRev) });
  return ok;
};

export const editAccept = (root: string, wt: string): string => {
  const plan = readJson<StoredPlan>(planFile(wt));
  if (!fs.existsSync(verifiedFile(wt))) throw new Error("尚未通过 verify，不能接受");
  const v = readJson<{ fingerprint: string }>(verifiedFile(wt));
  if (v.fingerprint !== fingerprint(wt, plan.baseRev)) throw new Error("verify 之后文件又发生了变化，请重新 verify");
  requireCleanMain(root, plan.baseRev);
  git(wt, ["add", "-A"]);
  git(wt, ["commit", "-q", "-m", `edit(${plan.lessonId}): ${plan.request}\n\n目标镜头: ${plan.targetSceneIds.join(", ")}\n类型: ${plan.kind}`]);
  git(root, ["merge", "--ff-only", "-q", plan.branch]);
  const rev = git(root, ["rev-parse", "--short", "HEAD"]);
  editDiscard(root, wt);
  return rev;
};

export const editDiscard = (root: string, wt: string): void => {
  const plan = readJson<StoredPlan>(planFile(wt));
  git(root, ["worktree", "remove", "--force", wt]);
  git(root, ["branch", "-D", plan.branch]);
};
