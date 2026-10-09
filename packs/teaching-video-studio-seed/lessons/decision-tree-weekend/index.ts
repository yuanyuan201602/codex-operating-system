import type React from "react";
import { ManifestSchema } from "../../src/lib/schema";
import manifestJson from "./manifest.json";
import S01 from "./scenes/s01-intro/Scene";
import S02 from "./scenes/s02-branch/Scene";
import S03 from "./scenes/s03-case/Scene";
import S04 from "./scenes/s04-takeaway/Scene";

export const manifest = ManifestSchema.parse(manifestJson);

export const scenes: Record<string, React.FC> = {
  "s01-intro": S01,
  "s02-branch": S02,
  "s03-case": S03,
  "s04-takeaway": S04,
};
