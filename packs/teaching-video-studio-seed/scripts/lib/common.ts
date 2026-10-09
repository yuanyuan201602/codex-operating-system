import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export type Issue = { level: "error" | "warn"; where: string; message: string };

export const readJson = <T = unknown>(file: string): T => JSON.parse(fs.readFileSync(file, "utf8")) as T;
export const writeJson = (file: string, data: unknown): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
};

export const lessonDir = (root: string, lessonId: string): string => path.join(root, "lessons", lessonId);

export const listLessons = (root: string): string[] => {
  const dir = path.join(root, "lessons");
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
};

export const git = (cwd: string, args: string[]): string =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

export const run = (cwd: string, cmd: string, args: string[]): { ok: boolean; output: string } => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  return { ok: r.status === 0, output: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim() };
};

export const report = (title: string, issues: Issue[]): boolean => {
  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");
  for (const i of [...errors, ...warns]) {
    console.log(`  ${i.level === "error" ? "错误" : "提示"} [${i.where}] ${i.message}`);
  }
  console.log(`${errors.length === 0 ? "通过" : "未通过"}  ${title}（${errors.length} 个错误，${warns.length} 个提示）`);
  return errors.length === 0;
};
