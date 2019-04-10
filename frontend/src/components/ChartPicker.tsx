import React from "react";
import IosThumbsDown from "react-ionicons/lib/IosThumbsDown";
import IosThumbsUp from "react-ionicons/lib/IosThumbsUp";
import styled from "styled-components";
import { CastVote, Chart, ExtendedState, Settings } from "../types/voteTypes";

const DOWNVOTE_COLOR = "#F1396D";
const UPVOTE_COLOR = "#8F9924";

const SongRating = styled.span`
  display: inline-block;
  padding: 1px;
  background-color: black;
  color: white;
  min-width: 1.5rem;
  padding: 0.2rem;
  text-align: center;
  font-weight: bold;
  border-radius: 1px;
  margin-right: 0.25rem;
`;

const SongTitle = styled.div`
  font-weight: bold;
  font-size: 1.3rem;
  text-align: center;
`;

const PlayerVote = styled.span<{ color: string }>`
  display: inline-flex;
  background-color: ${props => props.color};
  color: white;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  vertical-align: middle;
  font-weight: bold;
  padding: 0.5rem;
  margin-top: 0.5rem;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
`;

const StyledSong = styled.div`
  color: black;
  margin-bottom: 1rem;
  padding: 0.75rem;
  color: black;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  user-select: none;
  cursor: pointer;
`;

const Votes = styled.div`
  margin-top: 0.5rem;
`;

const ThumbsDown = styled(IosThumbsDown)`
  margin-right: 0.2rem;
`;

const ThumbsUp = styled(IosThumbsUp)`
  margin-right: 0.2rem;
`;

const NextPlayerVote = styled(PlayerVote)`
  margin: 0;
`;

const NextUp = styled.div`
  display: inline-flex;
  align-items: center;
  margin-bottom: 1rem;

  & > *:first-child {
    margin-right: 0.5rem;
  }
`;

const Header = styled.h1`
  font-size: 1.75rem;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const getPlayer = (settings: Settings, id: string): string => {
  const player = settings.players.find(p => p.playerId === id);
  return player ? player.name : "UNKNOWN";
};

const ChartWithVotes = React.memo<{
  chart: Chart;
  votes: CastVote[];
  settings: Settings;
  onClick?: () => void;
}>(({ chart, votes, settings, onClick }) => {
  const downvotes = votes.filter(vote => vote.type === "downvote");
  const upvotes = votes.filter(vote => vote.type === "upvote");

  return (
    <StyledSong onClick={onClick}>
      <SongTitle>
        <SongRating>{chart.difficultyRating}</SongRating> {chart.title}
      </SongTitle>

      {(!!upvotes.length || !!downvotes.length) && (
        <Votes>
          <div>
            {upvotes.map((vote, i) => (
              <PlayerVote key={i} color={UPVOTE_COLOR}>
                <ThumbsUp color="white" fontSize="1rem" />
                {getPlayer(settings, vote.playerId)}
              </PlayerVote>
            ))}
          </div>
          <div>
            {downvotes.map((vote, i) => (
              <PlayerVote key={i} color={DOWNVOTE_COLOR}>
                <ThumbsDown color="white" fontSize="1rem" />
                {getPlayer(settings, vote.playerId)}
              </PlayerVote>
            ))}
          </div>
        </Votes>
      )}
    </StyledSong>
  );
});

const ChartPicker = React.memo<{
  state: ExtendedState;
  onChartClick?: (chart: Chart) => void;
}>(({ state, onChartClick }) => {
  if (state.phase === "pick") {
    const { nextVote, settings, chartPool, votes } = state;

    return (
      <>
        <Header>Song selection</Header>

        {nextVote && (
          <NextUp>
            <div>Next up:</div>
            <NextPlayerVote
              color={nextVote.type === "upvote" ? UPVOTE_COLOR : DOWNVOTE_COLOR}
            >
              {nextVote.type === "upvote" ? (
                <ThumbsUp color="white" fontSize="1rem" />
              ) : (
                <ThumbsDown color="white" fontSize="1rem" />
              )}
              {getPlayer(settings, nextVote.playerId)}
            </NextPlayerVote>
          </NextUp>
        )}

        {chartPool.map(chart => (
          <ChartWithVotes
            settings={settings}
            key={chart.chartId}
            chart={chart}
            votes={votes.filter(vote => vote.chartId === chart.chartId)}
            onClick={onChartClick && (() => onChartClick(chart))}
          />
        ))}
      </>
    );
  }

  if (state.phase === "done") {
    return (
      <>
        <Header>Selected songs</Header>

        {state.selectedCharts.map(chart => (
          <ChartWithVotes
            settings={state.settings}
            key={chart.chartId}
            chart={chart}
            votes={[]}
          />
        ))}
      </>
    );
  }

  return null;
});

export default ChartPicker;
