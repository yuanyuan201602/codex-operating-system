# 斯摩棱斯克案例与复现说明

> 路径占位符：`<项目目录>` 指斯摩棱斯克工程根目录（含 `HANDOFF.md`、`full/` 等）；`<渲染环境目录>` 指装有渲染依赖的旧渲染工作区（位于旧 `douyin-render` 目录下，含 `node_modules/playwright-core` 与 `.venv`）。使用时替换为本机实际绝对路径。

整理：2026-09-28。这里记录已运行过的制作链路和换题材边界；本轮工作流整理未重新渲染视频。用户认为 v4 已“差不多”，允许以后继续修饰，当前转入流程与教程沉淀。这是本阶段认可，不代表逐项史实审定或公开发布批准。

## 1. 当前工程和证据入口

实际项目：`<项目目录>`。不要把聊天所在的“视频创造者”目录或旧 `douyin-render` 目录误当成当前编辑根。

| 要查什么 | 当前项目中的位置 |
|---|---|
| 最新交接 | `HANDOFF.md` 顶部，历史记录在分隔线后 |
| 史料及分歧 | `HISTORY.md` |
| 案例调研 | `CASES.md`；其中早期条目明确有些画面未观看 |
| 参考截图 | `review-competitor/`、`full/v2-preview/flags/compare_02_0718.png` |
| 当前分镜 | `STORYBOARD.md` 顶部 |
| 制作经过 | `full/WORKLOG.md` |
| 现有音频 | `full/work/audio/narration_r15.wav` |
| 最终视频 | `full/landscape/斯摩棱斯克-横屏完整版-v4.mp4` |
| v4 检查 | `full/landscape/v4/verification.json` 及同目录细项 |
| 编码后抽帧 | `full/landscape/v4/encoded-*.png` |
| 播放器 | `full/landscape/preview.html` |

当前成片：1920×1080、30 fps、2340 帧、78 秒画面；容器 78.016 秒。SHA-256：`0d90ec3878d99348868c47b3d0dc6d9abe8d360b2439ed4fc077973b560249c2`。

v4 检查记录显示：部队坐标排版位移为 0；完整音视频解码、关键地名、字体、日期与口播同步等检查通过；6 个抽样帧任意定位与连续渲染一致。播放器曾实测播放、章节跳转、重载和同秒切换 v3.1。目录外层的旧 `full/landscape/verification.json` 属于 v3.1，不能代替 v4 结果。

对标是香薄鱼《第四次哈尔科夫战役》的截图和并排比较图，没有完整原片。已比较构图、纹理、旗标与数字层级，未验证完整运动或声音的一致性。

## 2. 实际研究带来的决定

| 发现 | 采用的处理 | 项目证据 |
|---|---|---|
| 竖屏中城市、部队和旗标互相挤压 | 用户确认改成 16:9，保留地图的东西方向展开 | `HANDOFF.md`、旧 v2 比较资料 |
| 原排位混合了地理位置和标签位置 | 恢复 22 个部队显示条目、91 个原始节点，标签独立避让 | `full/landscape/v4/source-preservation.json` 与布局检查 |
| 原片的质感来自背景和信息层级 | 增加有出处的地表纹理，聚焦出口、戈梅利与叶利尼亚 | 当前镜头、`terrain-source.json`、v4 编码抽帧 |
| 用户要求不使用卐字旗 | 自绘红底、白圆、黑色铁十字式替代标识，片尾说明不是制式军旗 | `battle.js`、`draw.js`、片尾 |
| 自动检查通过但关键渡口地名消失 | 调整引线避让，增加必须显示关键地名的检查，再输出全片 | `full/WORKLOG.md`、`check_landscape.py` |

历史研究不能概括为“全都读过一手资料”：`HISTORY.md` 区分了官方战史、学术地图、百科转引及未读原著，仍有日期和统计口径分歧。流程整理没有重新考证全部战役。

已有技术调研读过 [MapLibre 的符号排位实现](https://github.com/maplibre/maplibre-gl-js/blob/main/src/symbol/placement.ts)，用于理解文字锚点与排位思路；没有把整个 MapLibre 引入成片。

地表来自 [NASA Blue Marble 图层元数据](https://gibs.earthdata.nasa.gov/layer-metadata/v1.0/BlueMarble_ShadedRelief_Bathymetry.json)，标注为 2004 年 8 月，按 [GIBS 访问说明](https://nasa-gibs.github.io/gibs-api-docs/access-basics/) 获取。请求范围、原图和哈希保存在 `full/work/engine/terrain-source.json`；使用条件参见 [NASA Earthdata](https://www.earthdata.nasa.gov/engage/open-data-services-software/data-use-policy)。它仅作现代地理背景。旗帜核查曾参考 [Royal Museums Greenwich](https://www.rmg.co.uk/collections/objects/rmgc-object-482) 和 [Australian War Memorial](https://www.awm.gov.au/collection/C1222806)，没有把馆藏照片用作视频素材。

## 3. 哪些文件负责哪一层

路径基于 `full/work/engine/`：

| 文件 | 责任 | 换战役时 |
|---|---|---|
| `battle.js` | 日期、字幕、部队显示数据、镜头、帧数与片尾 | 按新战役重新编排 |
| `frontlines.js` | 战线关键帧、锚点、合围区域和来源代号 | 重新研究并描绘 |
| `forces.json` | 原始部队轨迹对照数据 | 与实际显示轨迹同步核对；不能只改一处 |
| `engine.js` | 坐标投影、按帧求值、形变和事件逻辑 | 可复用方法；合围与冻结逻辑含本战役条件 |
| `draw.js` | 样式、旗标、文字、引线和预计算布局 | 可复用排版策略；包含专属地点和数字标注 |
| `page.html` | 字体和素材加载、画布、按帧输出 | 核对新素材是否加载完毕 |
| `render.mjs`、`serve.mjs` | Chrome 捕帧并将 PNG 流交给 FFmpeg | 适配依赖、输出尺寸与帧数后可复用 |
| `basemap.json`、`hillshade.png`、`terrain-nasa.png` | 本战区地图资产 | 新区域重新取得，保留出处和年代 |

其他入口：`full/work/mux_landscape.py` 合成声音；`full/work/checks/check_landscape.py` 检查当前战役；`full/work/preview_server.py` 提供带范围请求支持的本地视频预览。

这不是一个已经参数化的通用生成器。78 秒、30 fps、2340 帧、22 个条目、日期锚点和地名检查都属于本片，不能只改标题就复用。

## 4. 本机复现命令

以下命令保留当前 v4，用新的时间戳目录承接输出。按顺序在同一个终端运行；这些命令用于重新制作，不需要为了阅读流程而执行。

先核对环境。当前引擎可从本地 `playwright-core` 加载；找不到时使用原项目依赖。也可通过 `SMOLENSK_PLAYWRIGHT`、`SMOLENSK_CHROME` 指定路径。旧 `package.json` 主要声明 `canvas`，没有完整表达现在的渲染环境，不能声称只运行一次包安装就能复现。

```sh
cd '<项目目录>/full/work/engine'
node --version
ffmpeg -version
ffprobe -version
node -e "const p=require('<渲染环境目录>/node_modules/playwright-core'); console.log(Boolean(p.chromium))"
'<渲染环境目录>/.venv/bin/python' -c 'import shapely; print(shapely.__version__)'

SMOLENSK_RUN="../../landscape/reuse-$(date +%Y%m%d-%H%M%S)"
mkdir "$SMOLENSK_RUN"
```

如果新目录已存在或任一步报错，先处理对应问题，不能继续覆盖旧结果。新机器需要分别核对 Node、Chrome、FFmpeg、Playwright 和 Python/Shapely；本工作流包不包含这些软件，也不自动安装。

**看关键帧与 29 秒组合短样。** 短样拼接多个风险段，时间已被压缩且没有声音；不能直接拿完整口播与它混音。

```sh
node render.mjs --frames 150,680,1045,1450,1750,2240 --out "$SMOLENSK_RUN/keyframes"
node render.mjs --frames 780-1229,1300-1469,1590-1839 --video "$SMOLENSK_RUN/motion.mp4" --out "$SMOLENSK_RUN/motion-stills"
```

**输出全片并检查布局。** 渲染器把图像流直接送入编码器，只保存选定静帧，不需要保存所有 PNG。

```sh
node render.mjs --video "$SMOLENSK_RUN/video-only.mp4" --audit "$SMOLENSK_RUN/frames.jsonl" --out "$SMOLENSK_RUN/final-keyframes"
'<渲染环境目录>/.venv/bin/python' ../checks/check_landscape.py "$SMOLENSK_RUN/frames.jsonl" "$SMOLENSK_RUN/layout-verification.json"
```

**合成现有口播。** 原脚本固定读取 `narration_r15.wav`、固定 78 秒，使用 macOS 的 `aac_at` 编码器。换旁白、时长或系统时必须先适配该脚本；当前两遍响度处理只是本片设置，不是所有发布平台的统一要求。

```sh
python3 ../mux_landscape.py --video "$SMOLENSK_RUN/video-only.mp4" --output "$SMOLENSK_RUN/final.mp4" --report "$SMOLENSK_RUN/audio-normalization.json"
ffprobe -v error -show_streams -show_format -of json "$SMOLENSK_RUN/final.mp4" > "$SMOLENSK_RUN/media-probe.json"
ffmpeg -v error -i "$SMOLENSK_RUN/final.mp4" -map 0:v:0 -map 0:a:0 -f null -
```

抽取出口附近的实际编码帧，并保存哈希：

```sh
ffmpeg -v error -i "$SMOLENSK_RUN/final.mp4" -vf 'select=eq(n\,680)' -frames:v 1 "$SMOLENSK_RUN/encoded-0680.png"
shasum -a 256 "$SMOLENSK_RUN/final.mp4"
```

这些命令完成渲染、布局与媒体结构检查，**不自动完成**声音试听、参考观感、全部字形、任意定位一致性或浏览器交互检查。按 [制作流程第 7 步](production-workflow.md#7-输出后检查实际-mp4) 完成剩余验证；不能把旧 v4 的检查 JSON 复制成新版本的证据。

## 5. 预览、恢复与迁移

当前入口为 `http://127.0.0.1:8779/preview.html`，默认 v4，可与 v3.1 同秒比较。服务已运行时直接使用；需要重启时，从项目根执行：

```sh
python3 full/work/preview_server.py 8779
```

新输出还没有自动接入播放器，可先直接打开新 MP4；确认后再更新 `preview.html` 的视频、封面与版本文案。避免新旧文件混用，更新后重新测试播放和定位。不要为启动新服务而直接杀掉占用端口的未知进程。

恢复入口：`full/v3-before-landscape-20260928.tgz`、`full/v3.1-before-visual-pass-20260928.tgz` 和 `full/v4-landscape-source-20260928.tgz`。先查看归档内容；需要恢复时解包到新目录，不覆盖当前工程。v4 归档是工作流整理前的制作快照，不包含后来新增的流程和教程文件。

迁移到另一场战役时，在用户指定目录准备新工程。重新整理史料、素材范围与许可、叙事、战线、部队、通道事件和镜头，再适配专属代码与检查。优先复用绘制和渲染机制，不把本片轨迹当成通用模板。
