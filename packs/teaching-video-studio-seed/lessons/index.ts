import type React from "react";
import type { Manifest } from "../src/lib/schema";
import * as decisionTreeWeekend from "./decision-tree-weekend";

export type LessonModule = { manifest: Manifest; scenes: Record<string, React.FC> };

export const lessons: Record<string, LessonModule> = {
  "decision-tree-weekend": decisionTreeWeekend,
};
