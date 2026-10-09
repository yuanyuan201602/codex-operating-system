import React from "react";
import { LAYOUT } from "../theme/tokens";
import { useTheme } from "./theme";

export const Heading: React.FC<{
  title: string;
  subtitle?: string;
  progress?: number;
  align?: "left" | "center";
  top?: number;
}> = ({ title, subtitle, progress = 1, align = "center", top = 110 }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        position: "absolute",
        left: LAYOUT.margin,
        right: LAYOUT.margin,
        top: top + (1 - progress) * 24,
        opacity: progress,
        textAlign: align,
      }}
    >
      <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: 2 }}>{title}</div>
      {subtitle ? (
        <div style={{ fontSize: 36, marginTop: 18, color: theme.inkSoft }}>{subtitle}</div>
      ) : null}
    </div>
  );
};
