import React from "react";
import { Caption, Heading, Panel, Stage, ramp, useSceneT } from "../../../../src/kit";
import spec from "./scene.json";

const Scene: React.FC = () => {
  const t = useSceneT();
  return (
    <Stage>
      <Heading title="带走一个方法" progress={ramp(t, 0, 0.08)} top={90} />
      <Panel x={240} y={240} w={1440} h={130} lines={["1  先问一个能回答“是”或“否”的问题"]} progress={ramp(t, 0.08, 0.18)} />
      <Panel x={240} y={395} w={1440} h={130} lines={["2  看答案，沿着这条路走到下一个问题"]} progress={ramp(t, 0.22, 0.32)} />
      <Panel x={240} y={550} w={1440} h={130} lines={["3  一直走到底，就得到结果"]} progress={ramp(t, 0.36, 0.46)} />
      <Panel
        x={240}
        y={720}
        w={1440}
        h={130}
        lines={["想一想：周日下雨，会走到哪一个结果？"]}
        progress={ramp(t, 0.54, 0.64)}
        fontSize={38}
      />
      <Caption lines={spec.captions} />
    </Stage>
  );
};

export default Scene;
