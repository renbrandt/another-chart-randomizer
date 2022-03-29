import { AxiosInstance } from "axios";
import { stripIndent } from "common-tags";
import { Field, Formik } from "formik";
import { isEmpty, uniq } from "lodash";
import React from "react";
import uuid from "uuid";
import * as yup from "yup";
import { Chart, ExtendedState, Player, Settings } from "../types/voteTypes";

interface BracketData {
  groups: Group[];
}

interface Group {
  name: string;
  players: string[];
}

interface Values {
  charts: string;
  players: string;
  howManyChartsToVoteFrom: string;
  howManyChartsToRandomize: string;
  requiredDifficulties?: number[];
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
  function handleOnChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // TODO: fetch bracket data from google sheets
    setBracketState(event.currentTarget.value);
  }

  function handleOnGroupChange(
    event: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (field: string, value: any) => void
  ) {
    setSelectedGroupState(event.currentTarget.value);
    const selectedGroup = groupState.find(x => x.name === selectedGroupState);

    if (!selectedGroup) {
      console.log(
        `Error: group ${selectedGroupState} not found in groupState!`
      );
      return;
    }

    setFieldValue("players", selectedGroup.players.join("\n"));
  }

  const [bracketState, setBracketState] = React.useState("lower");
  const [selectedGroupState, setSelectedGroupState] = React.useState("");
  const [groupState, setGroupState] = React.useState<Group[]>([]);

  // Fetch default bracket data when component is mounted
  React.useEffect(() => {
    client
      .get(`/groups/${bracketState}`)
      .then(res => res.data.groups as Group[])
      .then(groups => setGroupState(groups))
      .catch(err => console.log(err));
  }, []);

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
        howManyChartsToVoteFrom: parseInt(data.howManyChartsToVoteFrom, 10),
        requiredDifficulties: uniq(charts.map(x => x.difficultyRating))
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

  const submitUndo = React.useCallback(async () => {
    await client.post("/undoVote");
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
        {({ handleSubmit, isSubmitting, isValid, errors, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <label>
              <p>Bracket:</p>
              <select
                name="bracket"
                value={bracketState}
                onChange={handleOnChange}
                style={{ marginBottom: "10px" }}
              >
                <option value="lower" label="Lower">
                  Lower
                </option>
                <option value="upper" label="Upper">
                  Upper
                </option>
              </select>
            </label>
            {groupState.length > 0 && (
              <label>
                <p>Group:</p>
                <select
                  name="group"
                  value={selectedGroupState}
                  onChange={ev => handleOnGroupChange(ev, setFieldValue)}
                  style={{ marginBottom: "10px" }}
                >
                  {groupState.map(group => {
                    return (
                      <option
                        key={group.name}
                        value={group.name}
                        label={group.name}
                      >
                        {group.name}
                      </option>
                    );
                  })}
                </select>
              </label>
            )}
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
        <button onClick={submitReset}>Reset</button>
        <button onClick={submitUndo} disabled={state.votes.length === 0}>
          Undo
        </button>
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
