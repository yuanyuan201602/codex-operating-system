import React from "react";
import { lerp } from "../lib/anim";
import { useTheme } from "./theme";

export type NodeVariant = "question" | "answer" | "plain";

/** 以 (x, y) 为中心点放置的节点，progress 控制出现，active 控制高亮。 */
export const FlowNode: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  variant?: NodeVariant;
  progress?: number;
  active?: number;
  fontSize?: number;
}> = ({ x, y, w = 300, h = 100, label, variant = "plain", progress = 1, active = 0, fontSize = 40 }) => {
  const theme = useTheme();
  const isQuestion = variant === "question";
  const fill = isQuestion ? theme.primary : theme.card;
  const ink = isQuestion ? theme.primaryOn : theme.ink;
  const scale = lerp(0.85, 1, progress) * lerp(1, 1.06, active);
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: isQuestion ? 28 : 50,
        background: fill,
        color: ink,
        fontSize,
        fontWeight: 700,
        border: `4px solid ${active > 0.01 ? theme.accent : isQuestion ? theme.primary : theme.line}`,
        boxShadow: active > 0.01 ? `0 0 ${lerp(0, 36, active)}px ${theme.accent}` : "none",
        opacity: progress,
        transform: `scale(${scale})`,
      }}
    >
      {label}
    </div>
  );
};
