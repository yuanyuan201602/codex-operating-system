import React from "react";
import { Composition } from "remotion";
import { lessons } from "../lessons";
import { LessonVideo } from "./LessonVideo";

export const Root: React.FC = () => (
  <>
    {Object.entries(lessons).map(([id, { manifest }]) => (
      <Composition
        key={id}
        id={id}
        component={LessonVideo}
        durationInFrames={manifest.scenes.reduce((n, s) => n + Math.round(s.durationSec * manifest.fps), 0)}
        fps={manifest.fps}
        width={manifest.width}
        height={manifest.height}
        defaultProps={{ lessonId: id }}
      />
    ))}
  </>
);
