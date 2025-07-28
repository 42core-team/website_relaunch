"use client";
import { useEffect } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Node,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";

const MATCH_WIDTH = 200;
const MATCH_HEIGHT = 80;
const ROUND_SPACING = 280;
const VERTICAL_SPACING = 100;

type SerializedMatch = {
  id: string;
  state: string;
  round: number;
  winner: { id: string; name: string } | null;
  teams: { id: string; name: string }[];
  createdAt: Date;
  updatedAt: Date;
};

const getMatchStatusColor = (state: string) => {
  switch (state) {
    case "FINISHED":
      return "#e6f7ff";
    case "READY":
      return "#f0f9eb";
    case "IN_PROGRESS":
      return "#fff7e6";
    default:
      return "#f5f5f5";
  }
};

const getMatchStatusBorder = (state: string) => {
  switch (state) {
    case "FINISHED":
      return "#1890ff";
    case "READY":
      return "#52c41a";
    case "IN_PROGRESS":
      return "#fa8c16";
    default:
      return "#d9d9d9";
  }
};

function createTreeCoordinate(matchCount: number): { x: number; y: number }[] {
  const coordinates: { x: number; y: number }[] = [];
  const totalRounds = Math.ceil(Math.log2(matchCount + 1));

  for (let round = 0; round < totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round - 1);
    const spacing = Math.pow(2, round) * VERTICAL_SPACING;

    for (let match = 0; match < matchesInRound; match++) {
      const x = round * ROUND_SPACING;
      const y = match * spacing + spacing / 2;

      coordinates.push({ x, y });
    }
  }

  return coordinates;
}

export default function GraphView({ matches }: { matches: SerializedMatch[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    console.log(createTreeCoordinate(16));
    const newNodes = createTreeCoordinate(8).map((coord, index): Node => {
      return {
        id: index.toString(),
        position: { x: coord.x, y: coord.y },
        style: {
          width: MATCH_WIDTH,
          height: MATCH_HEIGHT,
        },
        data: {},
      };
    });

    console.log(newNodes);
    setNodes(newNodes);
  }, [matches]);

  return (
    <div className="w-full">
      <div style={{ width: "100%", height: "80vh" }}>
        <style jsx global>{`
          .react-flow__handle {
            display: none;
          }
          .react-flow__node {
            font-family:
              -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              "Helvetica Neue", Arial, sans-serif;
          }
        `}</style>
        <ReactFlow
          nodesDraggable={false}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesConnectable={false}
          minZoom={0.0002}
          maxZoom={5.5}
        >
          <Background color="#f0f0f0" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}
