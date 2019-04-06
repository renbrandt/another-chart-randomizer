/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Status } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetMatches
// ====================================================

export interface GetMatches_Matches_docs_tournamentId {
  __typename: "TournamentResponse";
  description: string | null;
  status: Status | null;
  startDate: string | null;
  endDate: string | null;
  created: string | null;
}

export interface GetMatches_Matches_docs_games_stepChart {
  __typename: "Stepchart";
  stepArtist: string | null;
  bannerUrl: string | null;
  difficultyLevel: number | null;
  durationSeconds: number | null;
  created: string | null;
}

export interface GetMatches_Matches_docs_games {
  __typename: "GameResponse";
  stepChart: GetMatches_Matches_docs_games_stepChart;
}

export interface GetMatches_Matches_docs {
  __typename: "MatchResponse";
  tournamentId: GetMatches_Matches_docs_tournamentId;
  games: (GetMatches_Matches_docs_games | null)[] | null;
  status: Status | null;
  playedAt: string | null;
}

export interface GetMatches_Matches {
  __typename: "MatchesResponse";
  docs: (GetMatches_Matches_docs | null)[] | null;
}

export interface GetMatches {
  Matches: GetMatches_Matches | null;
}
