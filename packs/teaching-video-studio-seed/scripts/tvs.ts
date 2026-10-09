import path from "node:path";
import { ROOT, listLessons, readJson, report, run, type Issue } from "./lib/common";
import { editAccept, editBegin, editDiscard, editVerify } from "./lib/edit";
import { lintScenes } from "./lib/lint";
import { exportMp4, renderStills } from "./lib/render";
import { scaffoldLesson } from "./lib/scaffold";
import { storyboardView, validateLesson } from "./lib/validate";
import { ManifestSchema } from "../src/lib/schema";

const HELP = `tvs — 教学视频定制台命令

  check [lessonId]                         契约校验 + 禁用写法扫描 + 类型检查
  scaffold <lessonId>                      把已确认的 storyboard.draft.json 拆成镜头目录
  storyboard <lessonId>                    输出完整分镜视图（供审阅 / 界面使用）
  stills <lessonId> [outDir]               按镜头相对位置截关键帧
  export <lessonId>                        渲染 MP4，ffprobe 校验通过后才算完成
  edit begin <lessonId> --kind scene|duration|global --scenes s02-x,s03-y --request "..." [--confirm-global]
  edit verify <worktree>                   范围、静态检查、关键帧回归
  edit accept <worktree>                   通过 verify 后合并为新版本
  edit discard <worktree>                  丢弃候选版本，旧版本不受影响
`;

const flag = (args: string[], name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const main = async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case "check": {
      const lessons = rest[0] ? [rest[0]] : listLessons(ROOT);
      let ok = true;
      for (const id of lessons) {
        console.log(`\n== ${id}`);
        const issues: Issue[] = [...validateLesson(ROOT, id)];
        issues.push(...lintScenes(ROOT, id));
        ok = report("契约与禁用写法", issues) && ok;
      }
      const tsc = run(ROOT, path.join(ROOT, "node_modules", ".bin", "tsc"), ["--noEmit"]);
      console.log(`${tsc.ok ? "通过" : "未通过"}  类型检查${tsc.ok ? "" : "\n" + tsc.output}`);
      process.exit(ok && tsc.ok ? 0 : 1);
      break;
    }
    case "scaffold": {
      const ids = scaffoldLesson(ROOT, rest[0]);
      console.log(`已生成 ${ids.length} 个镜头: ${ids.join(", ")}`);
      break;
    }
    case "storyboard": {
      const manifest = ManifestSchema.parse(readJson(path.join(ROOT, "lessons", rest[0], "manifest.json")));
      console.log(JSON.stringify(storyboardView(ROOT, rest[0], manifest), null, 2));
      break;
    }
    case "stills": {
      const out = path.resolve(rest[1] ?? path.join(ROOT, "out", rest[0], "stills", "current"));
      const hashes = await renderStills(ROOT, rest[0], out);
      console.log(`已输出 ${Object.keys(hashes).length} 张关键帧到 ${out}`);
      break;
    }
    case "export": {
      const { file, probe } = await exportMp4(ROOT, rest[0]);
      console.log(`导出完成并通过校验: ${file}\n${JSON.stringify(probe)}`);
      break;
    }
    case "edit": {
      const [sub, target, ...flags] = rest;
      if (sub === "begin") {
        const kind = flag(flags, "kind") as "scene" | "duration" | "global";
        const wt = editBegin(ROOT, {
          lessonId: target,
          kind,
          sceneIds: (flag(flags, "scenes") ?? "").split(",").filter(Boolean),
          request: flag(flags, "request") ?? "",
          confirmedGlobal: flags.includes("--confirm-global"),
        });
        console.log(`候选版本工作区: ${wt}\n在该目录内修改，然后运行: npm run tvs -- edit verify ${wt}`);
      } else if (sub === "verify") {
        process.exit((await editVerify(ROOT, path.resolve(target))) ? 0 : 1);
      } else if (sub === "accept") {
        console.log(`已合并为新版本 ${editAccept(ROOT, path.resolve(target))}`);
      } else if (sub === "discard") {
        editDiscard(ROOT, path.resolve(target));
        console.log("已丢弃候选版本");
      } else console.log(HELP);
      break;
    }
    default:
      console.log(HELP);
  }
};

main().catch((e: unknown) => {
  console.error(`失败: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
