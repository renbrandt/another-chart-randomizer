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

const Controller = React.memo<Props>(({ client, state }) => {
  const submitStart = React.useCallback(
    async (data: Values) => {
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
        upvoteWeight: 1,
        downvoteWeight: 1,
        howManyChartsToRandomize: 4,
        howManyChartsToVoteFrom: 8
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
        validationSchema={validationSchema}
        initialValues={{ charts: "", players: "" }}
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
