import React from "react";
import IosThumbsDown from "react-ionicons/lib/IosThumbsDown";
import IosThumbsUp from "react-ionicons/lib/IosThumbsUp";
import posed, { PoseGroup } from "react-pose";
import styled from "styled-components";
import { CastVote, Chart, ExtendedState, Settings } from "../types/voteTypes";

const DOWNVOTE_COLOR = "#F1396D";
const UPVOTE_COLOR = "#8F9924";

const BAN_COLOR = "#ff002f";
const PICK_COLOR = "#00ff00";
const VOTE_COLOR = "#388fd5";

const comeFromBottom = {
  preEnter: {
    opacity: 0,
    y: 50,
    transition: { type: "spring", stiffness: 200, mass: 0.6 }
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, mass: 0.6 }
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: { type: "spring", stiffness: 200, mass: 0.6 }
  }
};

const SongRating = styled.span`
  display: inline-block;
  background-color: black;
  color: white;
  min-width: 1.5rem;
  padding: 0.2rem;
  text-align: center;
  font-weight: bold;
  border-radius: 1px;
  margin-right: 0.25rem;
`;

const PercentToPick = styled.span<{ color: string }>`
  display: inline-block;
  background-color: black;
  color: ${props => props.color};
  min-width: 1.5rem;
  padding: 0.2rem 0.5rem;
  text-align: center;
  font-weight: normal;
  border-radius: 1px;
  float: right;
  margin-right: 0.25rem;
`;

const SongTitle = styled.div`
  font-weight: bold;
  font-size: 1.3rem;
  text-align: center;
`;

const PlayerVote = posed(styled.span<{ color: string }>`
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
`)({
  enter: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, mass: 0.6 }
  },
  exit: {
    opacity: 0,
    y: 50,
    transition: { type: "spring", stiffness: 200, mass: 0.6 }
  }
});

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

const NextUp = posed(styled.div`
  display: inline-flex;
  align-items: center;
  margin-bottom: 1rem;

  & > *:first-child {
    margin-right: 0.5rem;
  }
`)(comeFromBottom);

const Header = posed(styled.h1`
  font-size: 1.75rem;
  margin-bottom: 1rem;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
`)(comeFromBottom);

const Text = posed.p(comeFromBottom);

const getPlayer = (settings: Settings, id: string): string => {
  const player = settings.players.find(p => p.playerId === id);
  return player ? player.name : "UNKNOWN";
};

const Section = posed.div({
  preEnter: { opacity: 0, staggerChildren: 30 },
  enter: {
    opacity: 1,
    staggerChildren: ({ slow }: any) => (slow ? 2000 : 30),
    delayChildren: 500,
    delay: 500
  },
  exit: { opacity: 0, staggerChildren: 30 }
});

const ChartWithVotes = posed(
  React.forwardRef<
    any,
    {
      chart: Chart;
      votes: CastVote[];
      probability: string;
      settings: Settings;
      onClick?: () => void;
    }
  >(({ chart, votes, probability, settings, onClick }, ref) => {
    const downvotes = votes.filter(vote => vote.type === "downvote");
    const upvotes = votes.filter(vote => vote.type === "upvote");

    return (
      <StyledSong onClick={onClick} ref={ref}>
        <SongTitle>
          <SongRating>{chart.difficultyRating}</SongRating> {chart.title}
          {probability !== "" && (
            <PercentToPick
              color={
                probability === "0.0"
                  ? BAN_COLOR
                  : probability === "100"
                  ? PICK_COLOR
                  : VOTE_COLOR
              }
            >
              {probability}%
            </PercentToPick>
          )}
        </SongTitle>

        {(!!upvotes.length || !!downvotes.length) && (
          <Votes>
            <div>
              <PoseGroup withParent={false}>
                {upvotes.map((vote, i) => (
                  <PlayerVote key={i} color={UPVOTE_COLOR}>
                    <ThumbsUp color="white" fontSize="1rem" />
                    {getPlayer(settings, vote.playerId)}
                  </PlayerVote>
                ))}
              </PoseGroup>
            </div>
            <div>
              <PoseGroup withParent={false}>
                {downvotes.map((vote, i) => (
                  <PlayerVote key={i} color={DOWNVOTE_COLOR}>
                    <ThumbsDown color="white" fontSize="1rem" />
                    {getPlayer(settings, vote.playerId)}
                  </PlayerVote>
                ))}
              </PoseGroup>
            </div>
          </Votes>
        )}
      </StyledSong>
    );
  })
)(comeFromBottom);

const ChartPicker = React.memo<{
  state: ExtendedState;
  onChartClick?: (chart: Chart) => void;
}>(({ state, onChartClick }) => {
  const contents = React.useMemo(() => {
    if (state.phase === "pick") {
      const { nextVote, settings, chartPool, votes } = state;

      const playerCount = settings.players.length;

      const ticketsPerChart = chartPool.map(chart => {
        const upvotes = votes.filter(
          vote => vote.chartId === chart.chartId && vote.type === "upvote"
        ).length;

        const downvotes = votes.filter(
          vote => vote.chartId === chart.chartId && vote.type === "downvote"
        ).length;

        const isGuaranteedPick = upvotes === playerCount;
        const tickets =
          downvotes >= 1 || isGuaranteedPick
            ? 0
            : Math.ceil(100 * Math.pow(2, upvotes - downvotes));

        return {
          chartId: chart.chartId,
          tickets,
          isGuaranteedPick
        };
      });

      const totalTickets = ticketsPerChart.reduce(
        (total, curr) => (total += curr.tickets),
        0
      );

      return (
        <Section key="selection">
          <Header>Song selection</Header>

          {nextVote && (
            <NextUp>
              <div>Next up:</div>
              <NextPlayerVote
                color={
                  nextVote.type === "upvote" ? UPVOTE_COLOR : DOWNVOTE_COLOR
                }
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
              probability={
                ticketsPerChart.find(x => x.chartId === chart.chartId)!
                  .isGuaranteedPick
                  ? "100"
                  : (
                      (ticketsPerChart.find(x => x.chartId === chart.chartId)!
                        .tickets /
                        totalTickets) *
                      100
                    ).toFixed(1)
              }
              votes={votes.filter(vote => vote.chartId === chart.chartId)}
              onClick={onChartClick && (() => onChartClick(chart))}
            />
          ))}
        </Section>
      );
    }

    if (state.phase === "done") {
      return (
        <Section key="done" slow={true}>
          <Header>Selected songs</Header>

          {state.selectedCharts.map(chart => (
            <ChartWithVotes
              settings={state.settings}
              key={chart.chartId}
              chart={chart}
              probability={""}
              votes={[]}
            />
          ))}

          <Text>Done!</Text>
        </Section>
      );
    }

    return <Section key="unknown" />;
  }, [state, onChartClick]);

  return (
    <PoseGroup preEnterPose="preEnter" flipMove={true}>
      {contents}
    </PoseGroup>
  );
});

export default ChartPicker;
