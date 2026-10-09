import React from "react";
import { Series } from "remotion";
import { lessons } from "../lessons";
import { ThemeProvider } from "./kit";

export const LessonVideo: React.FC<{ lessonId: string }> = ({ lessonId }) => {
  const lesson = lessons[lessonId];
  if (!lesson) throw new Error(`未注册的课程 ${lessonId}`);
  const { manifest, scenes } = lesson;
  return (
    <ThemeProvider styleId={manifest.style}>
      <Series>
        {manifest.scenes.map((s) => {
          const Scene = scenes[s.id];
          if (!Scene) throw new Error(`manifest 中的镜头 ${s.id} 没有注册场景组件`);
          return (
            <Series.Sequence key={s.id} durationInFrames={Math.round(s.durationSec * manifest.fps)} name={s.id}>
              <Scene />
            </Series.Sequence>
          );
        })}
      </Series>
    </ThemeProvider>
  );
};
