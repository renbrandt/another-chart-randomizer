import axios from "axios";
import * as React from "react";
import Websocket from "react-websocket";
import "reset-css";
import styled, { createGlobalStyle } from "styled-components";
import ChartPicker from "./components/ChartPicker";
import Controller from "./components/Controller";
import { CastVote, Chart, ExtendedState, Vote } from "./types/voteTypes";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3333";
const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:3333/state";

const client = axios.create({
  baseURL: API_URL
});

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Exo:300,400,500,600,700,800');

  html, body, #root {
    width: 100%;
    height: 100%;
    background: transparent;
  }
`;

const Container = styled.div`
  display: flex;
  height: 100%;
  justify-content: stretch;

  > * {
    flex-basis: 50%;
    flex-grow: 1;
  }
`;

const SelectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
  font-family: "Exo";
`;

const Center = styled.div`
  max-width: 40rem;
  width: 100%;
  text-align: center;
`;

const ControllerContainer = styled.div`
  padding: 2rem;

  label {
    display: block;
    margin-bottom: 1rem;
  }
`;

const App = () => {
  const [state, setState] = React.useState<ExtendedState | null>(null);

  const handleMessage = React.useCallback((msg: string) => {
    setState(JSON.parse(msg));
  }, []);

  const handleChartClick = React.useCallback(
    async (chart: Chart) => {
      if (!chart || !state || !state.nextVote) {
        return;
      }

      const vote: CastVote = { ...state.nextVote, chartId: chart.chartId };

      client.post("/newVote", vote);
    },
    [state]
  );

  return (
    <>
      <GlobalStyles />
      <Websocket url={WS_URL} onMessage={handleMessage} />
      <Container>
        {state && (
          <ControllerContainer>
            <Controller client={client} state={state} />
          </ControllerContainer>
        )}
        {state && (
          <SelectionContainer>
            <Center>
              <ChartPicker state={state} onChartClick={handleChartClick} />
            </Center>
          </SelectionContainer>
        )}
      </Container>
    </>
  );
};

export default App;
