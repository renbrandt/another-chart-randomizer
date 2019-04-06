import { createModel } from "@rematch/core";
import { getMatches, Match } from "../service/padmiss";

interface MatchesState {
  data: Match[] | null;
}

const matches = createModel({
  name: "matches",
  state: {
    data: null
  },
  reducers: {
    setMatches: (state: MatchesState, payload: Match[]) => ({
      ...state,
      data: payload
    })
  },
  effects: {
    async loadMatches() {
      this.setMatches(await getMatches());
    }
  }
});

export default matches;
