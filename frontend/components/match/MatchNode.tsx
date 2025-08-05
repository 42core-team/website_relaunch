"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { Match, MatchState } from "@/app/actions/tournament-model";

interface MatchNodeData {
  match: Match;
  width?: number;
  height?: number;
  onClick?: (match: Match) => void;
}

interface MatchNodeProps {
  data: MatchNodeData;
}

const getMatchStateStyles = (state: MatchState) => {
  switch (state) {
    case MatchState.FINISHED:
      return {
        backgroundColor: "#dcfce7",
        borderColor: "#16a34a",
        textColor: "#15803d",
      };
    case MatchState.PLANNED:
      return {
        backgroundColor: "#f8fafc",
        borderColor: "#64748b",
        textColor: "#475569",
      };
    case MatchState.IN_PROGRESS:
      return {
        backgroundColor: "#fff7ed",
        borderColor: "#ea580c",
        textColor: "#c2410c",
      };
    default:
      return {
        backgroundColor: "#f8fafc",
        borderColor: "#64748b",
        textColor: "#475569",
      };
  }
};

const getMatchStateIcon = (state: MatchState) => {
  switch (state) {
    case MatchState.FINISHED:
      return "✓";
    case MatchState.PLANNED:
      return "⏳";
    case MatchState.IN_PROGRESS:
      return null; // We'll use the animated circle
    default:
      return "?";
  }
};

function MatchNode({ data }: MatchNodeProps) {
  const { match, width = 200, height = 80, onClick } = data;
  const styles = getMatchStateStyles(match.state);
  const icon = getMatchStateIcon(match.state);

  const handleClick = () => {
    onClick?.(match);
  };

  const formatTeamName = (teamName: string, maxLength: number = 12) => {
    return teamName.length > maxLength
      ? `${teamName.substring(0, maxLength)}...`
      : teamName;
  };

  return (
    <motion.div
      className={`relative rounded-lg border-2 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md`}
      style={{
        width,
        height,
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.textColor,
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated progress indicator for IN_PROGRESS matches */}
      {match.state === MatchState.IN_PROGRESS && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* State icon */}
      {icon && (
        <div className="absolute top-2 right-2 text-sm font-bold">{icon}</div>
      )}

      <div className="p-3 h-full flex flex-col justify-between">
        {/* Match info */}
        <div className="flex-1">
          <div className="text-xs font-semibold mb-1 opacity-75">
            Round {match.round}
          </div>

          {/* Teams */}
          <div className="space-y-1">
            {match.teams && match.teams.length > 0 ? (
              match.teams.map((team, index) => (
                <div
                  key={index}
                  className={`text-sm font-medium flex justify-between items-center ${
                    match.winner?.name === team.name ? "font-bold" : ""
                  }`}
                >
                  <span className="truncate flex-1">
                    {formatTeamName(team.name)}
                  </span>
                  {match.state === MatchState.FINISHED &&
                    team.score !== undefined && (
                      <span className="ml-2 text-xs">{team.score}</span>
                    )}
                </div>
              ))
            ) : (
              <div className="text-sm font-medium text-center opacity-60">
                TBD
              </div>
            )}
          </div>
        </div>

        {/* Winner info */}
        {match.winner && match.state === MatchState.FINISHED && (
          <div className="text-xs font-bold mt-2 text-center">
            🏆 {formatTeamName(match.winner.name)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(MatchNode);
