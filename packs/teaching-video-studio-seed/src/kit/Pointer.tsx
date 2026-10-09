import React from "react";
import { useTheme } from "./theme";

/** 沿路径移动的小圆点，用于“跟着走一遍”。position 由场景按进度算好传入。 */
export const Pointer: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        position: "absolute",
        left: x - 22,
        top: y - 22,
        width: 44,
        height: 44,
        borderRadius: 22,
        background: theme.accent,
        border: `5px solid ${theme.card}`,
        boxShadow: `0 4px 14px rgba(0,0,0,0.25)`,
        opacity,
      }}
    />
  );
};
