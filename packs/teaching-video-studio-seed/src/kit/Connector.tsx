import React from "react";
import { useTheme } from "./theme";

/** 竖-横-竖的折线连线，并在折线中点附近标注文字（如“是 / 否”）。 */
export const Connector: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  progress?: number;
  active?: number;
}> = ({ from, to, label, progress = 1, active = 0 }) => {
  const theme = useTheme();
  const midY = (from.y + to.y) / 2;
  const d = `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
  const color = active > 0.5 ? theme.accent : theme.line;
  return (
    <>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      >
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth={active > 0.5 ? 9 : 6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
        />
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: (from.x + to.x) / 2 - 30,
            top: midY - 54,
            width: 60,
            textAlign: "center",
            fontSize: 34,
            fontWeight: 700,
            color: theme.inkSoft,
            opacity: progress > 0.6 ? 1 : 0,
          }}
        >
          {label}
        </div>
      ) : null}
    </>
  );
};
