import ApolloClient, { gql } from "apollo-boost";
import { ReturnPromiseType } from "../utils/types";
import {
  GetMatches,
  GetMatches_Matches_docs
} from "./__generated__/GetMatches";

const client = new ApolloClient({
  uri: process.env.REACT_APP_PADMISS_URL || "https://api.padmiss.com/graphql"
});

export const GET_MATCHES = gql`
  query GetMatches {
    Matches {
      docs {
        tournamentId {
          description
          status
          startDate
          endDate
          created
        }

        games {
          stepChart {
            stepArtist
            bannerUrl
            difficultyLevel
            durationSeconds
            created
          }
        }

        status
        playedAt
      }
    }
  }
`;

export type Match = GetMatches_Matches_docs;

export const getMatches = async () => {
  const result = await client.query<GetMatches>({
    query: GET_MATCHES
  });

  // schema is still lacking a bit
  return (result.data.Matches && result.data.Matches.docs) as Match[];
};

export default client;
