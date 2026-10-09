import React, { createContext, useContext } from "react";
import { themes, type Theme } from "../theme/tokens";

const ThemeContext = createContext<Theme>(themes["clean-diagram"]);

export const ThemeProvider: React.FC<{ styleId: string; children: React.ReactNode }> = ({
  styleId,
  children,
}) => {
  const theme = themes[styleId];
  if (!theme) throw new Error(`未知风格 ${styleId}，可用: ${Object.keys(themes).join(", ")}`);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => useContext(ThemeContext);
