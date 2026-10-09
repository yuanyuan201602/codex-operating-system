import React from "react";
import { AbsoluteFill } from "remotion";
import { useTheme } from "./theme";

export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: theme.fontFamily, color: theme.ink }}>
      {children}
    </AbsoluteFill>
  );
};
