import { find, findLast, sample, times } from "lodash";

// generic types

interface Chart {
  chartId: string;
  difficultyRating: number;
  title: string;
  subtitle: string | null;
}

interface Player {
  playerId: string;
  name: string;
}

interface Configuration {
  charts: Chart[];
  players: Player[]; // order matters here – first player can pick first!
  chartsToRandomize: number;
  upvoteWeight: number;
  downvoteWeight: number;
}

interface Vote {
  type: "upvote" | "downvote";
  playerId: string;
}

interface CastVote extends Vote {
  chartId: string;
}

const matchingVotes = (a: Vote, b: Vote) =>
  a.type === b.type && a.playerId === b.playerId;

// actions and state

export type Action =
  | {
      type: "start";
      payload: Configuration;
    }
  | {
      type: "newVote";
      payload: CastVote;
    }
  | {
      type: "makePicks";
    };

// state

export type State =
  | {
      phase: "init";
    }
  | {
      phase: "pick";
      settings: Configuration;
      votes: CastVote[];
    }
  | {
      phase: "done";
      settings: Configuration;
      votes: CastVote[];
      selectedCharts: Chart[];
    };

// da magic

const nextVote = (state: State): Vote | null => {
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

const randomizeCharts = (
  { charts, players, chartsToRandomize }: Configuration,
  votes: CastVote[]
): Chart[] => {
  const initialPoints = players.length;

  let chartsWithWeights = charts.map(chart => {
    const upvotes = votes.filter(
      vote => vote.chartId === chart.chartId && vote.type === "upvote"
    ).length;

    const downvotes = votes.filter(
      vote => vote.chartId === chart.chartId && vote.type === "downvote"
    ).length;

    return { chart, weight: initialPoints + upvotes - downvotes };
  });

  const randomizedCharts: Chart[] = [];

  times(chartsToRandomize, () => {
    const chartWithMaxWeight = chartsWithWeights.find(
      chartWithWeight => chartWithWeight.weight === initialPoints * 2
    );

    const chartsWithNoWeight = chartsWithWeights.filter(
      chartWithWeight => chartWithWeight.weight === 0
    );

    const pool = chartsWithWeights.flatMap(chartWithWeight =>
      times(chartWithWeight.weight, () => chartWithWeight.chart)
    );

    const nextChart = chartWithMaxWeight
      ? chartWithMaxWeight.chart
      : pool.length > 0
      ? sample(pool)!
      : chartsWithNoWeight[0].chart;

    randomizedCharts.push(nextChart);
    chartsWithWeights = chartsWithWeights.filter(
      chartWithWeight => chartWithWeight.chart.chartId !== nextChart.chartId
    );
  });

  return randomizedCharts;
};

export const initialState = {
  phase: "init" as "init"
};

export const chartPickerReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "start":
      return { phase: "pick", settings: action.payload, votes: [] };

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

      if (!chartIdExists(state.settings.charts, action.payload.chartId)) {
        throw new Error("Chart does not exist");
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
        selectedCharts: randomizeCharts(state.settings, state.votes)
      };
    }
  }
};
