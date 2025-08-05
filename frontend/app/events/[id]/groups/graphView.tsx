"use client";
import { useEffect } from "react";
import ReactFlow, { Node, useNodesState } from "reactflow";
import "reactflow/dist/style.css";
import { Match } from "@/app/actions/tournament";

export default function GraphView({ matches }: { matches: Match[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  useEffect(() => {
    if (!matches || matches.length === 0) return;

    const matchesByRound = matches.reduce(
      (acc, match) => {
        if (!acc[match.round]) acc[match.round] = [];
        acc[match.round].push(match);
        return acc;
      },
      {} as Record<number, Match[]>,
    );

    const rounds = Object.keys(matchesByRound)
      .map(Number)
      .sort((a, b) => a - b);

    const newNodes: Node[] = [];

    const COLUMN_WIDTH = 300;
    const ROW_HEIGHT = 80;
    const PADDING = 20;

    rounds.forEach((round, roundIndex) => {
      const roundMatches = matchesByRound[round];

      newNodes.push({
        id: `round-${round}`,
        position: {
          x: roundIndex * COLUMN_WIDTH + PADDING,
          y: PADDING,
        },
        data: {
          label: `Round ${round}`,
        },
        style: {
          width: COLUMN_WIDTH - PADDING * 2,
          textAlign: "center",
          fontWeight: "bold",
          padding: "10px",
        },
      });

      roundMatches.forEach((match, matchIndex) => {
        const nodeId = `match-${match.id}`;
        const xPos = roundIndex * COLUMN_WIDTH + PADDING;
        const yPos = (matchIndex + 1) * ROW_HEIGHT + PADDING;

        // Build match label with teams, score, and winner
        let matchLabel = "";
        if (match.teams && match.teams.length > 0) {
          matchLabel = match.teams
            .map((team, idx) => {
              let teamStr = team?.name || `Team ${idx + 1}`;

              return teamStr;
            })
            .join(" vs ");
        } else {
          matchLabel = `Match ${matchIndex + 1}`;
        }

        let winnerInfo = "";
        if (match.winner && match.state === "FINISHED") {
          winnerInfo = `Winner: ${match.winner.name}`;
        }

        let dateInfo = "";
        if (match.createdAt) {
          const date = new Date(match.createdAt);
          dateInfo = `Date: ${date.toLocaleString()}`;
        }

        // Combine all info
        const infoLines = [matchLabel];
        if (winnerInfo) infoLines.push(winnerInfo);
        if (dateInfo) infoLines.push(dateInfo);

        console.log(match.state);

        // Determine background color based on match state
        let backgroundColor = "#fff";
        if (match.state === "FINISHED") {
          backgroundColor = "#d4edda";
        } else if (match.state === "PLANNED") {
          backgroundColor = "#f8f9fa";
        } else if (match.state === "IN_PROGRESS") {
          backgroundColor = "#fff3cd";
        }

        newNodes.push({
          id: nodeId,
          position: { x: xPos, y: yPos },
          data: {
            label: infoLines.join("\n"),
          },
          style: {
            width: COLUMN_WIDTH - PADDING * 2,
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            whiteSpace: "pre-line",
            backgroundColor,
          },
        });
      });
    });

    setNodes(newNodes);
  }, [matches]);

  return (
    <div className="w-full">
      <div style={{ width: "100%", height: "80vh" }}>
        <style jsx global>{`
          .react-flow__handle {
            display: none;
          }
        `}</style>
        <ReactFlow
          nodesDraggable={false}
          nodes={nodes}
          onNodesChange={onNodesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesConnectable={false}
        />
      </div>
    </div>
  );
}
