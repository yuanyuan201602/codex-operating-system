import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ManifestSchema } from "../../src/lib/schema";
import { lessonDir, readJson, run, writeJson } from "./common";

export const STILL_FRACTIONS = [0.1, 0.5, 0.9] as const;

const browserExecutable = process.env.TVS_CHROME_BIN || null;

const setup = async (root: string, lessonId: string) => {
  if (!browserExecutable) await ensureBrowser();
  const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
  const composition = await selectComposition({ serveUrl, id: lessonId, browserExecutable });
  const manifest = ManifestSchema.parse(readJson(path.join(lessonDir(root, lessonId), "manifest.json")));
  return { serveUrl, composition, manifest };
};

export const sha256 = (file: string): string =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

/** 每个镜头按“镜头内相对位置”截关键帧，改时长后仍可逐镜头对齐比较。 */
export const renderStills = async (
  root: string,
  lessonId: string,
  outDir: string,
  only?: string[],
): Promise<Record<string, string>> => {
  const { serveUrl, composition, manifest } = await setup(root, lessonId);
  fs.mkdirSync(outDir, { recursive: true });
  const hashes: Record<string, string> = {};
  let start = 0;
  for (const s of manifest.scenes) {
    const frames = Math.round(s.durationSec * manifest.fps);
    if (!only || only.includes(s.id)) {
      for (const f of STILL_FRACTIONS) {
        const frame = start + Math.min(frames - 1, Math.floor(f * (frames - 1)));
        const name = `${s.id}@${Math.round(f * 100)}.png`;
        const output = path.join(outDir, name);
        await renderStill({ serveUrl, composition, frame, output, browserExecutable, imageFormat: "png" });
        hashes[name] = sha256(output);
      }
    }
    start += frames;
  }
  writeJson(path.join(outDir, "hashes.json"), hashes);
  return hashes;
};

export const compareStills = (
  baseHashes: Record<string, string>,
  newHashes: Record<string, string>,
  mustMatchScenes: string[],
): string[] => {
  const diffs: string[] = [];
  for (const name of Object.keys(baseHashes)) {
    const scene = name.split("@")[0];
    if (!mustMatchScenes.includes(scene)) continue;
    if (baseHashes[name] !== newHashes[name]) diffs.push(name);
  }
  return diffs;
};

type ProbeStream = { codec_type: string; codec_name: string; width?: number; height?: number; r_frame_rate?: string };

export const probeMp4 = (file: string) => {
  const r = run(process.cwd(), "ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file]);
  if (!r.ok) throw new Error(`ffprobe 失败: ${r.output}`);
  const data = JSON.parse(r.output) as { streams: ProbeStream[]; format: { duration: string } };
  const video = data.streams.find((s) => s.codec_type === "video");
  const audio = data.streams.find((s) => s.codec_type === "audio");
  const [n, d] = (video?.r_frame_rate ?? "0/1").split("/").map(Number);
  return {
    durationSec: Number(data.format.duration),
    width: video?.width,
    height: video?.height,
    fps: d ? n / d : 0,
    videoCodec: video?.codec_name,
    hasAudio: Boolean(audio),
  };
};

/** 先渲染到临时文件，ffprobe 校验通过后才改名为正式文件；失败不留残缺 MP4。 */
export const exportMp4 = async (root: string, lessonId: string): Promise<{ file: string; probe: ReturnType<typeof probeMp4> }> => {
  const { serveUrl, composition, manifest } = await setup(root, lessonId);
  const outDir = path.join(root, "out", lessonId);
  fs.mkdirSync(outDir, { recursive: true });
  const partial = path.join(outDir, `${lessonId}.partial.mp4`);
  const final = path.join(outDir, `${lessonId}.mp4`);
  fs.rmSync(partial, { force: true });
  await renderMedia({ serveUrl, composition, codec: "h264", outputLocation: partial, browserExecutable });
  const probe = probeMp4(partial);
  const expected = manifest.scenes.reduce((n, s) => n + s.durationSec, 0);
  const problems: string[] = [];
  if (Math.abs(probe.durationSec - expected) > 0.1) problems.push(`时长 ${probe.durationSec}s，预期 ${expected}s`);
  if (probe.width !== manifest.width || probe.height !== manifest.height) problems.push(`分辨率 ${probe.width}x${probe.height}`);
  if (Math.abs(probe.fps - manifest.fps) > 0.01) problems.push(`帧率 ${probe.fps}`);
  if (probe.videoCodec !== "h264") problems.push(`编码 ${probe.videoCodec}`);
  if (problems.length) {
    fs.renameSync(partial, path.join(outDir, `${lessonId}.rejected.mp4`));
    throw new Error(`导出校验未通过：${problems.join("；")}`);
  }
  fs.renameSync(partial, final);
  writeJson(path.join(outDir, "export.json"), {
    ...probe,
    audio: manifest.audio.mode === "silent" ? "静音（无音轨）" : manifest.audio.mode,
    file: final,
  });
  return { file: final, probe };
};
