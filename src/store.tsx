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

// see https://github.com/rematch/rematch/issues/601#issuecomment-466766288
declare module "react-redux" {
  interface Connect {
    <no_state = {}, TDispatchProps = {}, TOwnProps = {}>(
      mapStateToProps: null | undefined,
      mapDispatchToProps: (dispatch: Dispatch) => TDispatchProps
    ): InferableComponentEnhancerWithProps<TDispatchProps, TOwnProps>;

    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = {}>(
      mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
      mapDispatchToProps: (dispatch: Dispatch) => TDispatchProps
    ): InferableComponentEnhancerWithProps<
      TStateProps & TDispatchProps,
      TOwnProps
    >;
  }
}
