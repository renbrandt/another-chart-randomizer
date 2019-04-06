import * as React from "react";
import { connect } from "react-redux";
import { Dispatch, RootState } from "./store";

type Props = ReturnType<typeof mapState> & ReturnType<typeof mapDispatch>;

const App = React.memo<Props>(({ loadMatches, matches }) => {
  React.useEffect(() => {
    loadMatches();
  }, []);

  return <pre>{JSON.stringify(matches, null, 2)}</pre>;
});

const mapState = (state: RootState) => ({
  matches: state.matches.data
});

const mapDispatch = (dispatch: Dispatch) => ({
  loadMatches: dispatch.matches.loadMatches
});

export default connect(
  mapState,
  mapDispatch
)(App) as React.ComponentType<any>;
