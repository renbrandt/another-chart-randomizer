import axios, { AxiosInstance } from "axios";
import { stripIndent } from "common-tags";
import { Field, Formik } from "formik";
import { isEmpty } from "lodash";
import React from "react";
import uuid from "uuid";
import * as yup from "yup";
import { Chart, ExtendedState, Player, Settings } from "../types/voteTypes";

interface Values {
  charts: string;
  players: string;
  howManyChartsToVoteFrom: string;
  howManyChartsToRandomize: string;
}

const validationSchema = yup.object().shape({
  players: yup.string().required(),
  charts: yup
    .string()
    .matches(/^(\d+ .+\n)*\d+ .+\n?$/)
    .required()
});

interface Props {
  client: AxiosInstance;
  state: ExtendedState;
}

const getInitialValues = (): Values => {
  try {
    const storedValues = localStorage.getItem("formInitialValues");
    const parsedStoredValues = storedValues && JSON.parse(storedValues);
    return {
      charts: (parsedStoredValues && parsedStoredValues.charts) || "",
      players: (parsedStoredValues && parsedStoredValues.players) || "",
      howManyChartsToVoteFrom:
        (parsedStoredValues && parsedStoredValues.howManyChartsToVoteFrom) ||
        "6",
      howManyChartsToRandomize:
        (parsedStoredValues && parsedStoredValues.howManyChartsToRandomize) ||
        "4"
    };
  } catch {
    return {
      charts: "",
      players: "",
      howManyChartsToVoteFrom: "6",
      howManyChartsToRandomize: "4"
    };
  }
};

const Controller = React.memo<Props>(({ client, state }) => {
  const submitStart = React.useCallback(
    async (data: Values) => {
      localStorage.setItem("formInitialValues", JSON.stringify(data));

      const players: Player[] = data.players
        .split("\n")
        .map(name => name.trim())
        .filter(name => name)
        .map(name => ({ playerId: uuid(), name }));

      const charts: Chart[] = data.charts
        .trim()
        .split("\n")
        .map(s => s.match(/^(\d+) (.+) *$/))
        .map(([_, rating, title]) => ({
          chartId: uuid(),
          difficultyRating: parseInt(rating, 10),
          title,
          subtitle: ""
        }));

      const settings: Settings = {
        players,
        charts,
        howManyChartsToRandomize: parseInt(data.howManyChartsToRandomize, 10),
        howManyChartsToVoteFrom: parseInt(data.howManyChartsToVoteFrom, 10)
      };

      await client.post("/start", settings);
    },
    [client]
  );

  const submitReset = React.useCallback(async () => {
    if (confirm("You sure you want to reset?")) {
      await client.post("/reset");
    }
  }, [client]);

  const submitDone = React.useCallback(async () => {
    await client.post("/makePicks");
  }, [client]);

  if (state.phase === "init") {
    return (
      <Formik<Values>
        isInitialValid={true}
        validationSchema={validationSchema}
        initialValues={getInitialValues()}
        onSubmit={submitStart}
      >
        {({ handleSubmit, isSubmitting, isValid, errors }) => (
          <form onSubmit={handleSubmit}>
            <label>
              <p>Players:</p>
              <Field
                component="textarea"
                name="players"
                placeholder="One player per row, best first"
                rows={20}
                cols={80}
              />
            </label>

            <label>
              <p>Charts:</p>
              <Field
                component="textarea"
                name="charts"
                placeholder={stripIndent`
                    Block first, then title, one per row, like this:
                    
                    11 Loituma
                    12 Loituma ~Hyper Mix~
                    13 Loituma HARDCORE`}
                rows={20}
                cols={80}
              />
            </label>

            <label>
              <p>How many charts to vote from</p>
              <Field
                component="input"
                type="number"
                name="howManyChartsToVoteFrom"
              />
            </label>

            <label>
              <p>How many charts to randomize</p>
              <Field
                component="input"
                type="number"
                name="howManyChartsToRandomize"
              />
            </label>

            <div>
              {!isEmpty(errors) && <pre>{JSON.stringify(errors, null, 2)}</pre>}

              <button type="submit" disabled={!isValid || isSubmitting}>
                SUBMITTO
              </button>
            </div>
          </form>
        )}
      </Formik>
    );
  }

  if (state.phase === "pick") {
    return (
      <>
        <button onClick={submitReset}>Resetore</button>
        <button onClick={submitDone} disabled={state.nextVote !== null}>
          Done
        </button>
      </>
    );
  }

  if (state.phase === "done") {
    return (
      <>
        <button onClick={submitReset}>Resetore</button>
      </>
    );
  }

  return null;
});

export default Controller;
