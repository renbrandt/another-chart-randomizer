import { init, RematchDispatch, RematchRootState } from "@rematch/core";
import matches from "./models/matches";

const models = {
  matches
};

const store = init({
  models
});

export default store;
export type Store = typeof store;
export type Dispatch = RematchDispatch<typeof models>;
export type RootState = RematchRootState<typeof models>;
