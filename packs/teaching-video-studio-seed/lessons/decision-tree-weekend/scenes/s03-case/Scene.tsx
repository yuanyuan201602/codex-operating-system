import React from "react";
import {
  Caption,
  Heading,
  Pointer,
  Stage,
  TreeDiagram,
  lerp,
  ramp,
  useSceneT,
  type TreeEdgeSpec,
  type TreeNodeSpec,
} from "../../../../src/kit";
import spec from "./scene.json";

const NODES: TreeNodeSpec[] = [
  { id: "weather", label: "天气晴朗吗？", x: 960, y: 400, variant: "question", w: 360 },
  { id: "near", label: "距离近吗？", x: 600, y: 590, variant: "question", w: 320 },
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
  const leg1 = ramp(t, 0.32, 0.5);
  const leg2 = ramp(t, 0.56, 0.74);
  const arrived = ramp(t, 0.76, 0.84);
  const pos =
    leg2 > 0
      ? { x: lerp(600, 400, leg2), y: lerp(540, 735, leg2) }
      : { x: lerp(960, 600, leg1), y: lerp(450, 540, leg1) };
  return (
    <Stage>
      <Heading title="周六：晴天，目的地很近" progress={ramp(t, 0, 0.08)} top={90} />
      <TreeDiagram
        nodes={NODES}
        edges={EDGES}
        nodeActive={{
          weather: ramp(t, 0.26, 0.32),
          near: ramp(t, 0.5, 0.56),
          walk: arrived,
        }}
        edgeActive={{ "weather>near": leg1 > 0.99 ? 1 : 0, "near>walk": leg2 > 0.99 ? 1 : 0 }}
      />
      <Pointer x={pos.x} y={pos.y} opacity={ramp(t, 0.24, 0.3)} />
      <Caption lines={spec.captions} />
    </Stage>
  );
};

export default Scene;
