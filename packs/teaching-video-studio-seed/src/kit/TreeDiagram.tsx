import React from "react";
import { Connector } from "./Connector";
import { FlowNode, type NodeVariant } from "./FlowNode";

export type TreeNodeSpec = {
  id: string;
  label: string;
  x: number;
  y: number;
  variant?: NodeVariant;
  w?: number;
};
export type TreeEdgeSpec = { from: string; to: string; label?: string };

/**
 * 判断树 / 流程树。边的 id 为 `from>to`。
 * 各节点与边的出现、高亮进度由场景按归一化时间算好后传入，组件本身无状态。
 */
export const TreeDiagram: React.FC<{
  nodes: TreeNodeSpec[];
  edges: TreeEdgeSpec[];
  nodeProgress?: Record<string, number>;
  edgeProgress?: Record<string, number>;
  nodeActive?: Record<string, number>;
  edgeActive?: Record<string, number>;
}> = ({ nodes, edges, nodeProgress = {}, edgeProgress = {}, nodeActive = {}, edgeActive = {} }) => {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return (
    <>
      {edges.map((e) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b) throw new Error(`边 ${e.from}>${e.to} 引用了不存在的节点`);
        const key = `${e.from}>${e.to}`;
        return (
          <Connector
            key={key}
            from={{ x: a.x, y: a.y + 50 }}
            to={{ x: b.x, y: b.y - 50 }}
            label={e.label}
            progress={edgeProgress[key] ?? 1}
            active={edgeActive[key] ?? 0}
          />
        );
      })}
      {nodes.map((n) => (
        <FlowNode
          key={n.id}
          x={n.x}
          y={n.y}
          w={n.w}
          label={n.label}
          variant={n.variant}
          progress={nodeProgress[n.id] ?? 1}
          active={nodeActive[n.id] ?? 0}
        />
      ))}
    </>
  );
};
