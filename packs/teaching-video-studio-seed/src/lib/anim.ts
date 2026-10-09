import { interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";

/**
 * 场景内的一切动画都用 0..1 的归一化进度，而不是绝对帧数。
 * 这样修改 manifest 里的 durationSec 就能整体放慢或加快一个镜头，
 * 不需要改任何场景代码。
 */
export const useSceneT = (): number => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames - 1)));
};

export const ramp = (t: number, from: number, to: number): number =>
  interpolate(t, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;
