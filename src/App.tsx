import * as React from "react";
import { getMatches } from "./service/padmiss";
import { ReturnPromiseType } from "./utils/types";

const loadMatchesOnMount = () => {
  const [matches, setMatches] = React.useState<null | ReturnPromiseType<
    typeof getMatches
  >>(null);

  React.useEffect(() => {
    getMatches().then(result => {
      setMatches(result);
    });
  }, []);

  return matches;
};

const App = () => {
  const matches = loadMatchesOnMount();
  return <pre>{JSON.stringify(matches)}</pre>;
};

export default App;
