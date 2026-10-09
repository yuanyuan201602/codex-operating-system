import React from "react";
import { Caption, FlowNode, Heading, Stage, ramp, useSceneT } from "../../../../src/kit";
import spec from "./scene.json";

const QUESTIONS = [
  { x: 480, label: "天气好吗？" },
  { x: 960, label: "路远不远？" },
  { x: 1440, label: "怎么去？" },
];

const Scene: React.FC = () => {
  const t = useSceneT();
  return (
    <Stage>
      <Heading title="周末出门，怎么选？" subtitle="一次只回答一个问题" progress={ramp(t, 0.0, 0.1)} />
      {QUESTIONS.map((q, i) => (
        <FlowNode
          key={q.label}
          x={q.x}
          y={560}
          w={340}
          h={120}
          label={q.label}
          variant="question"
          progress={ramp(t, 0.25 + i * 0.18, 0.35 + i * 0.18)}
        />
      ))}
      <Caption lines={spec.captions} />
    </Stage>
  );
};

export default Scene;
