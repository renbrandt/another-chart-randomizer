/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Status } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetMatches
// ====================================================

export interface GetMatches_Matches_docs_tournamentId {
  __typename: "TournamentResponse";
  name: string;
}

export interface GetMatches_Matches_docs_players {
  __typename: "PlayerResponse";
  _id: string;
  nickname: string;
}

export interface GetMatches_Matches_docs_roundId_tournamentEventPartId {
  __typename: "TournamentEventPartResponse";
  name: string;
}

export interface GetMatches_Matches_docs_roundId_stepCharts_song {
  __typename: "Song";
  title: string;
  subTitle: string | null;
}

export interface GetMatches_Matches_docs_roundId_stepCharts {
  __typename: "Stepchart";
  _id: string;
  difficultyLevel: number | null;
  song: GetMatches_Matches_docs_roundId_stepCharts_song | null;
}

export interface GetMatches_Matches_docs_roundId {
  __typename: "RoundResponse";
  name: string;
  _id: string;
  tournamentEventPartId: GetMatches_Matches_docs_roundId_tournamentEventPartId;
  stepCharts: (GetMatches_Matches_docs_roundId_stepCharts | null)[] | null;
}

export interface GetMatches_Matches_docs {
  __typename: "MatchResponse";
  _id: string;
  status: Status | null;
  playedAt: string | null;
  tournamentId: GetMatches_Matches_docs_tournamentId;
  players: (GetMatches_Matches_docs_players | null)[];
  roundId: GetMatches_Matches_docs_roundId;
}

export interface GetMatches_Matches {
  __typename: "MatchesResponse";
  docs: (GetMatches_Matches_docs | null)[] | null;
}

export interface GetMatches {
  Matches: GetMatches_Matches | null;
}
