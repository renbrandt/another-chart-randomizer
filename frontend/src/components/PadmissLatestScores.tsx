import ApolloClient, { gql } from "apollo-boost";
import * as React from "react";
import styled from "styled-components";

const client = new ApolloClient({
  uri: "https://api.padmiss.com/graphql"
});

const Scores = styled.pre`
  font-family: monospace;
`;

const Container = styled.div`
  height: 50%;
  overflow: auto;
`;

const PadmissLatestScores = () => {
  const [scores, setScores] = React.useState<null | any>(null);

  const updateScores = React.useCallback(async () => {
    setScores(null);

    const { data } = await client.query({
      fetchPolicy: "no-cache",
      query: gql`
        query {
          Scores(
            queryString: "{ \\"arcadeCab\\": { \\"$in\\": [\\"5ac9f54de831d2018b6c8a69\\",\\"5ac9f54de831d2018b6c8a6a\\",\\"5ac9f54de831d2018b6c8a6b\\"] } }"
            sort: "-playedAt"
          ) {
            docs {
              _id
              arcadeCab {
                _id
                name
              }
              stepChart {
                song {
                  title
                  artist
                }
                playMode
                difficultyLevel
              }
              player {
                nickname
              }
              scoreValue
              scoreBreakdown {
                fantastics
                excellents
                greats
                decents
                wayoffs
                misses
              }
              speedMod {
                type
                value
              }
              playedAt
            }
          }
        }
      `
    });

    setScores(data);
  }, []);

  React.useEffect(() => {
    updateScores();
  }, [updateScores]);

  return (
    <Container>
      {/* <button onClick={updateScores}>Update</button>
      <Scores>
        {scores &&
          scores.Scores.docs
            .map((s: any) =>
              `${s.arcadeCab.name}  //  ${s.stepChart.song.title}  //  ${
                s.player.nickname
              }  //  ${(s.scoreValue * 100).toFixed(2)}`.trim()
            )
            .join("\n")}
      </Scores> */}
    </Container>
  );
};

export default PadmissLatestScores;
