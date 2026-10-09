export type Theme = {
  id: string;
  fontFamily: string;
  bg: string;
  ink: string;
  inkSoft: string;
  primary: string;
  primaryOn: string;
  tint: string;
  card: string;
  line: string;
  accent: string;
  danger: string;
  captionBg: string;
  captionInk: string;
};

const FONT =
  '"PingFang SC","Noto Sans SC","Microsoft YaHei","WenQuanYi Micro Hei","Droid Sans Fallback",sans-serif';

export const themes: Record<string, Theme> = {
  "clean-diagram": {
    id: "clean-diagram",
    fontFamily: FONT,
    bg: "#f7f8f2",
    ink: "#1f3a2f",
    inkSoft: "#5f7469",
    primary: "#2d5c49",
    primaryOn: "#ffffff",
    tint: "#e3eddc",
    card: "#fffef8",
    line: "#8fa597",
    accent: "#e0a526",
    danger: "#c85a4a",
    captionBg: "#dfe9d7",
    captionInk: "#1f3a2f",
  },
  "line-story": {
    id: "line-story",
    fontFamily: FONT,
    bg: "#0f1722",
    ink: "#f3e9d2",
    inkSoft: "#a9a08a",
    primary: "#d8b45a",
    primaryOn: "#0f1722",
    tint: "#1d2a3a",
    card: "#182333",
    line: "#6f7f93",
    accent: "#f0c96a",
    danger: "#e07a6a",
    captionBg: "#1d2a3a",
    captionInk: "#f3e9d2",
  },
};

export const LAYOUT = {
  width: 1920,
  height: 1080,
  margin: 96,
  captionBottom: 56,
  captionHeight: 96,
} as const;
