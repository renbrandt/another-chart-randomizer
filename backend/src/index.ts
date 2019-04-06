import express from "express";
import expressWs, { Application } from "express-ws";
import * as chartPicker from "./chartPicker";

const app = (express() as unknown) as Application;
const wsInstance = expressWs(app);
app.use(express.json());

const port = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000;
const host = process.env.HOST || "127.0.0.1";

let randomizerState: chartPicker.State = chartPicker.initialState;

const broadcastState = () => {
  const serializedState = JSON.stringify(randomizerState);
  wsInstance.getWss().clients.forEach(client => client.send(serializedState));
};

app.post("/reset", (_, res) => {
  randomizerState = chartPicker.initialState;
  broadcastState();
  res.sendStatus(201);
});

app.post("/init", (req, res) => {
  randomizerState = chartPicker.chartPickerReducer(randomizerState, {
    type: "start",
    payload: req.body
  });
  broadcastState();
  res.sendStatus(201);
});

app.post("/vote", (req, res) => {
  randomizerState = chartPicker.chartPickerReducer(randomizerState, {
    type: "newVote",
    payload: req.body
  });
  broadcastState();
  res.sendStatus(201);
});

app.post("/makePicks", (_, res) => {
  randomizerState = chartPicker.chartPickerReducer(randomizerState, {
    type: "makePicks"
  });
  broadcastState();
  res.sendStatus(201);
});

app.ws("/listen", ws => {
  ws.send(JSON.stringify(randomizerState));
});

app.listen(port, host, () =>
  // tslint:disable-next-line no-console
  console.log(`Example app listening on port ${port}!`)
);
