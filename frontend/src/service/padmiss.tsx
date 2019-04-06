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
        _id
        status
        playedAt

        tournamentId {
          name
        }

        players {
          _id
          nickname
        }

        roundId {
          name
          _id

          tournamentEventPartId {
            name
          }

          stepCharts {
            _id
            difficultyLevel
            song {
              title
              subTitle
            }
          }
        }
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
  return (result.data.Matches &&
    result.data.Matches.docs) as GetMatches_Matches_docs[];
};

export default client;
