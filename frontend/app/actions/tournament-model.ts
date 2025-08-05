export enum MatchPhase {
  SWISS = "SWISS",
  ELIMINATION = "ELIMINATION",
}

export enum MatchState {
  PLANNED = "PLANNED",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

export interface Match {
  id: string;
  round: number;
  state: MatchState;
  phase: MatchPhase;
  createdAt: string;
  updatedAt: string;
  teams: {
    name: string;
    score: number;
  }[];
  winner?: {
    name: string;
    score: number;
  };
}
