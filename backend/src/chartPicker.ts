import { find, findLast, flatMap, sample, sampleSize, times } from "lodash";

// generic types

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
  requiredDifficulties: number[];
}

export interface Vote {
  type: "upvote" | "downvote";
  playerId: string;
}

export interface CastVote extends Vote {
  chartId: string;
}

const matchingVotes = (a: Vote, b: Vote) =>
  a.type === b.type && a.playerId === b.playerId;

// actions and state

export type Action =
  | {
      type: "start";
      payload: Settings;
    }
  | {
      type: "newVote";
      payload: CastVote;
    }
  | {
      type: "makePicks";
    }
  | { type: "undoVote" };

// state

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

// da magic

export const nextVote = (state: State): Vote | null => {
  if (state.phase !== "pick") {
    return null;
  }

  const nextDownvotePlayer = find(
    state.settings.players,
    ({ playerId }) =>
      !state.votes.some(vote =>
        matchingVotes(vote, { playerId, type: "downvote" })
      )
  );

  const nextUpvotePlayer = findLast(
    state.settings.players,
    ({ playerId }) =>
      !state.votes.some(vote =>
        matchingVotes(vote, { playerId, type: "upvote" })
      )
  );

  if (nextDownvotePlayer) {
    return { playerId: nextDownvotePlayer.playerId, type: "downvote" };
  } else if (nextUpvotePlayer) {
    return { playerId: nextUpvotePlayer.playerId, type: "upvote" };
  } else {
    return null;
  }
};

const chartIdExists = (charts: Chart[], chartId: string): boolean => {
  return charts.some(chart => chart.chartId === chartId);
};

function getChartPool(
  charts: Chart[],
  howManyChartsToVoteFrom: number,
  requiredDifficulties: number[]
): Chart[] {
  // First randomize the required charts
  const requiredRandomizedCharts: Chart[] = requiredDifficulties.map(diff => {
    // Get the charts with the specified difficulty rating
    const chartsOfRequiredDiff: Chart[] = charts.filter(
      x => x.difficultyRating === diff
    );

    if (chartsOfRequiredDiff.length === 0) {
      throw new Error(`No charts exist for difficulty ${diff}!!!!`);
    }

    // Pick one of the charts of the specified difficulty rating by random
    return sample(chartsOfRequiredDiff)!;
  });

  // Then randomize the remaining charts
  const remainingCharts = Math.max(
    0,
    howManyChartsToVoteFrom - requiredRandomizedCharts.length
  );
  // Do not allow to pick the same chart multiple times
  const chartsExceptRequiredCharts = charts.filter(
    x => !requiredRandomizedCharts.includes(x)
  );

  // Pick the remaining charts by random
  const otherRandomizedCharts: Chart[] = sampleSize(
    chartsExceptRequiredCharts,
    remainingCharts
  );

  return [...requiredRandomizedCharts, ...otherRandomizedCharts];
}

const randomizeCharts = (
  { howManyChartsToRandomize }: Settings,
  votes: CastVote[],
  charts: Chart[]
): Chart[] => {
  const initialPoints = 100;
  const FACTOR = 2;

  let chartsWithWeights = charts.map(chart => {
    const upvotes = votes.filter(
      vote => vote.chartId === chart.chartId && vote.type === "upvote"
    ).length;

    const downvotes = votes.filter(
      vote => vote.chartId === chart.chartId && vote.type === "downvote"
    ).length;

    return {
      chart,
      weight: Math.ceil(initialPoints * Math.pow(FACTOR, upvotes - downvotes))
    };
  });

  const randomizedCharts: Chart[] = [];

  times(Math.min(howManyChartsToRandomize, charts.length), () => {
    const pool = flatMap(chartsWithWeights, chartWithWeight =>
      times(chartWithWeight.weight, () => chartWithWeight.chart)
    );

    const nextChart = sample(pool)!;

    randomizedCharts.push(nextChart);

    chartsWithWeights = chartsWithWeights.filter(
      chartWithWeight => chartWithWeight.chart.chartId !== nextChart.chartId
    );
  });

  return randomizedCharts;
};

export const initialState: State = {
  phase: "init"
};

export const chartPickerReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "start":
      return {
        phase: "pick",
        settings: action.payload,
        votes: [],
        chartPool: getChartPool(
          action.payload.charts,
          action.payload.howManyChartsToVoteFrom,
          action.payload.requiredDifficulties
        )
      };

    case "newVote": {
      if (state.phase !== "pick") {
        throw new Error("Illegal phase!");
      }

      const nextVoteToMake = nextVote(state);

      if (nextVoteToMake === null) {
        throw new Error("No votes left to make");
      }

      if (!matchingVotes(nextVoteToMake, action.payload)) {
        throw new Error("This vote cannot be made right now");
      }

      if (!chartIdExists(state.chartPool, action.payload.chartId)) {
        throw new Error("Chart does not exist in pool");
      }

      return { ...state, votes: [...state.votes, action.payload] };
    }

    case "makePicks": {
      if (state.phase !== "pick") {
        throw new Error("Illegal phase!");
      }

      const nextVoteToMake = nextVote(state);

      if (nextVoteToMake !== null) {
        throw new Error("There are votes left to make");
      }

      return {
        ...state,
        phase: "done",
        selectedCharts: randomizeCharts(
          state.settings,
          state.votes,
          state.chartPool
        )
      };
    }

    case "undoVote": {
      if (state.phase !== "pick") {
        throw new Error("Illegal phase!");
      }

      if (state.votes.length === 0) {
        return state;
      }

      return {
        ...state,
        votes: state.votes.slice(0, -1)
      };
    }
  }
};
