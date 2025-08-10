import { getLogsOfMatch } from "@/app/actions/tournament";
import MatchLogsDisplay from "@/components/match/MatchLogsDisplay";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const matchId = (await params).matchId;
  const matchLogs = await getLogsOfMatch(matchId);
  return (
    <>
      <MatchLogsDisplay logs={matchLogs} />
    </>
  );
}
