import cors from "cors";
import express from "express";
import expressWs, { Application } from "express-ws";
import { BracketData } from "./BracketDataParser.js";
import * as chartPicker from "./chartPicker.js";
import * as sheetsDataFetcher from "./sheetsDataFetcher.js";

const app = express() as unknown as Application;
const wsInstance = expressWs(app);
app.use(cors());
app.use(express.json());

const port = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3333;
const host = process.env.HOST || "127.0.0.1";

let chartPickerState: chartPicker.State = chartPicker.initialState;

const getState = (): chartPicker.ExtendedState => ({
  ...chartPickerState,
  nextVote: chartPicker.nextVote(chartPickerState),
});

const broadcastState = () => {
  const serializedState = JSON.stringify(getState());
  wsInstance.getWss().clients.forEach((client) => client.send(serializedState));
};

app.post("/reset", (_, res) => {
  chartPickerState = chartPicker.initialState;
  broadcastState();
  res.sendStatus(201);
});

app.get("/groups/:bracket", async (req, res) => {
  const bracket = req.params.bracket;
  let bracketData: BracketData | undefined;

  switch (bracket) {
    case "upper":
      bracketData = await sheetsDataFetcher.fetchDataFromGoogleApi(
        sheetsDataFetcher.upperBracketTab
      );
      break;
    case "lower":
      bracketData = await sheetsDataFetcher.fetchDataFromGoogleApi(
        sheetsDataFetcher.lowerBracketTab
      );
      break;
    default:
      return res.sendStatus(400);
  }

  if (!bracketData) {
    return res.sendStatus(500);
  }

  res.json(bracketData);
});

app.post("/start", (req, res) => {
  chartPickerState = chartPicker.chartPickerReducer(chartPickerState, {
    type: "start",
    payload: req.body,
  });
  broadcastState();
  res.sendStatus(201);
});

app.post("/newVote", (req, res) => {
  chartPickerState = chartPicker.chartPickerReducer(chartPickerState, {
    type: "newVote",
    payload: req.body,
  });
  broadcastState();
  res.sendStatus(201);
});

app.post("/makePicks", async (_, res) => {
  chartPickerState = chartPicker.chartPickerReducer(chartPickerState, {
    type: "makePicks",
  });
  broadcastState();

  // Send picks to google sheets
  // @ts-ignore
  const { settings, selectedCharts } = chartPickerState;
  await sheetsDataFetcher.sendSongPicksToSheets(settings, selectedCharts);
  res.sendStatus(201);
});

app.post("/undoVote", (_, res) => {
  chartPickerState = chartPicker.chartPickerReducer(chartPickerState, {
    type: "undoVote",
  });
  broadcastState();
  res.sendStatus(201);
});

app.ws("/state", (ws) => {
  ws.send(JSON.stringify(getState()));
});

app.listen(port, host, () =>
  // tslint:disable-next-line no-console
  console.log(`Example app listening on port ${port}!`)
);
