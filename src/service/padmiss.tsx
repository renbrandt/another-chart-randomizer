import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";

import {
  GetMatches,
  GetMatches_Matches_docs
} from "./__generated__/GetMatches";

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_PADMISS_URL || "https://api.padmiss.com/graphql"
});

// Create the apollo client
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true
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
