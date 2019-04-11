export type Phase = "init" | "pick" | "done";

export interface Chart {
  chartId: string;
  difficultyRating: number;
  title: string;
  subtitle: string | null;
}

export interface Player {
  playerId: string;
  name: string;
}

export interface Settings {
  charts: Chart[];
  players: Player[]; // order matters here – first player can pick first!
  howManyChartsToVoteFrom: number;
  howManyChartsToRandomize: number;
}

export interface Vote {
  type: "upvote" | "downvote";
  playerId: string;
}

export interface CastVote extends Vote {
  chartId: string;
}

export type State = { phase: Phase } & (
  | {
      phase: "init";
    }
  | {
      phase: "pick";
      chartPool: Chart[];
      settings: Settings;
      votes: CastVote[];
    }
  | {
      phase: "done";
      settings: Settings;
      votes: CastVote[];
      selectedCharts: Chart[];
    });

export type ExtendedState = State & {
  nextVote: Vote | null;
};
