import React from "react";
import { useTheme } from "./theme";

/** 带标题的卡片，用于要点、前置知识、对比栏等文字块。 */
export const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  lines: string[];
  progress?: number;
  fontSize?: number;
}> = ({ x, y, w, h, title, lines, progress = 1, fontSize = 40 }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + (1 - progress) * 20,
        width: w,
        height: h,
        padding: "20px 40px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: 32,
        background: theme.card,
        border: `3px solid ${theme.line}`,
        opacity: progress,
      }}
    >
      {title ? (
        <div style={{ fontSize: fontSize + 4, fontWeight: 800, color: theme.primary, marginBottom: 18 }}>
          {title}
        </div>
      ) : null}
      {lines.map((l) => (
        <div key={l} style={{ fontSize, lineHeight: 1.5, color: theme.ink }}>
          {l}
        </div>
      ))}
    </div>
  );
};
