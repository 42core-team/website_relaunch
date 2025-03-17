'use client';
import { MatchEntity } from "@/entities/match.entity";
import { useEffect } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Node,
    Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function GraphView({ matches }: {
    matches: MatchEntity[]
}) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (!matches || matches.length === 0) return;

        // Group matches by round
        const matchesByRound = matches.reduce((acc, match) => {
            if (!acc[match.round]) acc[match.round] = [];
            acc[match.round].push(match);
            return acc;
        }, {} as Record<number, MatchEntity[]>);

        // Sort rounds in ascending order (round 1 is the final)
        const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const matchToNodeMap = new Map<string, string>();

        // Constants for layout
        const COLUMN_WIDTH = 300;
        const PADDING = 40;
        const VERTICAL_GAP = 200;

        rounds.forEach((round, roundIndex) => {
            const roundMatches = matchesByRound[round];

            // Add round header
            newNodes.push({
                id: `round-${round}`,
                position: {
                    x: (rounds.length - roundIndex - 1) * COLUMN_WIDTH + PADDING,
                    y: PADDING
                },
                data: {
                    label: round === 1 ? "Final" : round === 2 ? "Semi-Finals" : `Round ${round}`
                },
                style: {
                    width: COLUMN_WIDTH - PADDING * 2,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    padding: '10px',
                }
            });

            // Calculate vertical spacing for matches in this round
            // Earlier rounds (higher numbers) need more vertical space
            const totalHeight = Math.pow(2, rounds.length - roundIndex) * VERTICAL_GAP;
            const matchHeight = totalHeight / roundMatches.length;

            roundMatches.forEach((match, matchIndex) => {
                const nodeId = `match-${match.id}`;
                // Position the match in the bracket
                const xPos = (rounds.length - roundIndex - 1) * COLUMN_WIDTH + PADDING;
                const yPos = matchHeight * (matchIndex + 0.5) + PADDING * 3;

                // Format match label
                let matchLabel = "";
                let winnerInfo = "";

                if (match.teams && match.teams.length > 0) {
                    matchLabel = match.teams.map(team => team.name || "Team").join(" vs ");
                    if (match.winner && match.state === 'FINISHED') {
                        winnerInfo = `Winner: ${match.winner.name}`;
                    }
                } else {
                    matchLabel = `Match ${matchIndex + 1}`;
                }

                newNodes.push({
                    id: nodeId,
                    position: { x: xPos, y: yPos },
                    data: {
                        label: winnerInfo ? `${matchLabel}\n${winnerInfo}` : matchLabel
                    },
                    style: {
                        width: COLUMN_WIDTH - PADDING * 2,
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: match.state === 'FINISHED' ? '#e6f7ff' :
                            match.state === 'READY' ? '#f0f9eb' : '#fff',
                    }
                });

                matchToNodeMap.set(match.id, nodeId);
            });
        });

        // Create edges between rounds to show advancement
        for (let i = 0; i < rounds.length - 1; i++) {
            const currentRound = rounds[i];
            const nextRound = rounds[i + 1];

            const currentMatches = matchesByRound[currentRound];
            const nextMatches = matchesByRound[nextRound];

            // Each match in the current round is fed by two matches in the next round
            currentMatches.forEach((currentMatch, idx) => {
                // Calculate which matches feed into this one
                const sourceIdx1 = idx * 2;
                const sourceIdx2 = idx * 2 + 1;

                if (sourceIdx1 < nextMatches.length) {
                    newEdges.push({
                        id: `e-${nextMatches[sourceIdx1].id}-${currentMatch.id}`,
                        source: matchToNodeMap.get(nextMatches[sourceIdx1].id)!,
                        target: matchToNodeMap.get(currentMatch.id)!,
                        type: 'smoothstep',
                        animated: currentMatch.state === 'READY'
                    });
                }

                if (sourceIdx2 < nextMatches.length) {
                    newEdges.push({
                        id: `e-${nextMatches[sourceIdx2].id}-${currentMatch.id}`,
                        source: matchToNodeMap.get(nextMatches[sourceIdx2].id)!,
                        target: matchToNodeMap.get(currentMatch.id)!,
                        type: 'smoothstep',
                        animated: currentMatch.state === 'READY'
                    });
                }
            });
        }

        setNodes(newNodes);
        setEdges(newEdges);
    }, [matches]);

    return (
        <div className="w-full">
            <div style={{ width: '100%', height: '80vh' }}>
                <style jsx global>{`
                    .react-flow__handle {
                        display: none;
                    }
                `}</style>
                <ReactFlow
                    nodesDraggable={false}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    nodesConnectable={false}
                />
            </div>
        </div>
    );
}