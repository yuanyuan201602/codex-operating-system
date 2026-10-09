import fs from "node:fs";
import path from "node:path";
import { lessonDir, type Issue } from "./common";

const RULES: { re: RegExp; message: string }[] = [
  { re: /#[0-9a-fA-F]{3,8}\b/, message: "不得硬编码十六进制颜色，请用 useTheme() 的 token" },
  { re: /\b(rgba?|hsla?)\s*\(/, message: "不得硬编码 rgb/hsl 颜色，请用 useTheme() 的 token" },
  { re: /fontFamily/, message: "不得设置 fontFamily，字体由风格 token 统一提供" },
  { re: /Math\.random|Date\.now|new Date\b/, message: "不得使用随机数或当前时间（渲染必须可复现）" },
  { re: /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource/, message: "不得访问网络" },
  { re: /\buseCurrentFrame\b/, message: "镜头内请用 useSceneT() 的归一化进度，不要用绝对帧数（否则改时长会失效）" },
  { re: /\b(child_process|process\.|require\s*\()/, message: "镜头代码不得使用系统能力" },
  { re: /\bdangerouslySetInnerHTML\b|\beval\s*\(|new Function\b/, message: "禁止动态执行代码" },
];

const ALLOWED_IMPORT = (spec: string): boolean =>
  spec === "react" ||
  spec === "remotion" ||
  spec === "../../../../src/kit" ||
  /^\.\/[\w.-]+$/.test(spec);

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

export const lintScenes = (root: string, lessonId: string, only?: string[]): Issue[] => {
  const issues: Issue[] = [];
  const sceneRoot = path.join(lessonDir(root, lessonId), "scenes");
  if (!fs.existsSync(sceneRoot)) return issues;
  for (const id of fs.readdirSync(sceneRoot)) {
    if (only && !only.includes(id)) continue;
    const dir = path.join(sceneRoot, id);
    for (const file of fs.readdirSync(dir).filter((f) => /\.tsx?$/.test(f))) {
      const src = stripComments(fs.readFileSync(path.join(dir, file), "utf8"));
      const where = `${id}/${file}`;
      for (const r of RULES) {
        if (r.re.test(src)) issues.push({ level: "error", where, message: r.message });
      }
      for (const m of src.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
        if (!ALLOWED_IMPORT(m[1])) {
          issues.push({ level: "error", where, message: `不允许的导入 "${m[1]}"，镜头只能导入 react、remotion、src/kit 和本目录文件` });
        }
      }
    }
  }
  return issues;
};
