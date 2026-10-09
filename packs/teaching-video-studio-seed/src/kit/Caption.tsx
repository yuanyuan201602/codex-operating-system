import React from "react";
import type { CaptionLine } from "../lib/schema";
import { LAYOUT } from "../theme/tokens";
import { useSceneT } from "../lib/anim";
import { useTheme } from "./theme";

const FADE = 0.025;

/** 字幕条：按镜头归一化进度显示 captions，一次只显示一行。 */
export const Caption: React.FC<{ lines: CaptionLine[] }> = ({ lines }) => {
  const theme = useTheme();
  const t = useSceneT();
  const line = lines.find((l) => t >= l.from && t <= l.to);
  if (!line) return null;
  const fadeIn = Math.min(1, (t - line.from) / FADE);
  const fadeOut = Math.min(1, (line.to - t) / FADE);
  return (
    <div
      style={{
        position: "absolute",
        left: LAYOUT.margin,
        right: LAYOUT.margin,
        bottom: LAYOUT.captionBottom,
        minHeight: LAYOUT.captionHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 56px",
        borderRadius: 48,
        background: theme.captionBg,
        color: theme.captionInk,
        fontSize: 44,
        fontWeight: 600,
        lineHeight: 1.35,
        textAlign: "center",
        opacity: Math.max(0, Math.min(fadeIn, fadeOut)),
      }}
    >
      {line.text}
    </div>
  );
};
