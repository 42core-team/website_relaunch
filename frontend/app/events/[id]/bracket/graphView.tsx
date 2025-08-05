"use client";
import { useEffect } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Node,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import { MatchNode } from "@/components/match";
import { Match } from "@/app/actions/tournament-model";

const MATCH_WIDTH = 200;
const MATCH_HEIGHT = 80;
const ROUND_SPACING = 280;
const VERTICAL_SPACING = 100;

// Custom node types for ReactFlow
const nodeTypes = {
  matchNode: MatchNode,
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

export default function GraphView({ matches }: { matches: Match[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!matches || matches.length === 0) {
      // Create placeholder nodes for visualization
      const newNodes = createTreeCoordinate(8).map((coord, index): Node => {
        const placeholderMatch: Match = {
          id: `placeholder-${index}`,
          round: index + 1,
          state: "PLANNED" as any,
          phase: "ELIMINATION" as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          teams: [],
        };

        return {
          id: index.toString(),
          type: "matchNode",
          position: { x: coord.x, y: coord.y },
          data: {
            match: placeholderMatch,
            width: MATCH_WIDTH,
            height: MATCH_HEIGHT,
          },
        };
      });
      setNodes(newNodes);
      return;
    }

    // Create nodes from actual match data
    const newNodes: Node[] = matches.map((match, index) => {
      const coordinates = createTreeCoordinate(matches.length);
      const coord = coordinates[index] || {
        x: 0,
        y: index * (MATCH_HEIGHT + 20),
      };

      return {
        id: match.id,
        type: "matchNode",
        position: { x: coord.x, y: coord.y },
        data: {
          match,
          width: MATCH_WIDTH,
          height: MATCH_HEIGHT,
          onClick: (clickedMatch: Match) => {
            console.log("Match clicked:", clickedMatch);
          },
        },
      };
    });

    setNodes(newNodes);
  }, [matches, setNodes]);

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
          nodeTypes={nodeTypes}
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
