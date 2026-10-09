import React from "react";
import {
  Caption,
  Heading,
  Stage,
  TreeDiagram,
  ramp,
  useSceneT,
  type TreeEdgeSpec,
  type TreeNodeSpec,
} from "../../../../src/kit";
import spec from "./scene.json";

const NODES: TreeNodeSpec[] = [
  { id: "weather", label: "天气晴朗吗？", x: 960, y: 400, variant: "question", w: 360 },
  { id: "near", label: "路程近吗？", x: 600, y: 590, variant: "question", w: 320 },
  { id: "bus1", label: "乘公交", x: 1320, y: 590 },
  { id: "walk", label: "步行", x: 400, y: 790 },
  { id: "bus2", label: "乘公交", x: 800, y: 790 },
];
const EDGES: TreeEdgeSpec[] = [
  { from: "weather", to: "near", label: "是" },
  { from: "weather", to: "bus1", label: "否" },
  { from: "near", to: "walk", label: "是" },
  { from: "near", to: "bus2", label: "否" },
];

const Scene: React.FC = () => {
  const t = useSceneT();
  return (
    <Stage>
      <Heading title="判断树：一步步展开" progress={ramp(t, 0, 0.06)} top={90} />
      <TreeDiagram
        nodes={NODES}
        edges={EDGES}
        nodeProgress={{
          weather: ramp(t, 0.05, 0.14),
          near: ramp(t, 0.32, 0.4),
          bus1: ramp(t, 0.54, 0.62),
          walk: ramp(t, 0.74, 0.82),
          bus2: ramp(t, 0.82, 0.9),
        }}
        edgeProgress={{
          "weather>near": ramp(t, 0.24, 0.32),
          "weather>bus1": ramp(t, 0.48, 0.54),
          "near>walk": ramp(t, 0.68, 0.74),
          "near>bus2": ramp(t, 0.76, 0.82),
        }}
      />
      <Caption lines={spec.captions} />
    </Stage>
  );
};

export default Scene;
