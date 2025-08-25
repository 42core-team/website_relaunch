import {
  getLogsOfMatch,
  getMatchById,
  getTournamentTeamCount,
} from "@/app/actions/tournament";
import MatchLogsDisplay from "@/components/match/MatchLogsDisplay";
import { isActionError } from "@/app/actions/errors";
import { isEventAdmin } from "@/app/actions/event";
import MatchActions from "@/app/events/[id]/match/[matchId]/matchActions";
import { Button } from "@heroui/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string; id: string }>;
}) {
  const { matchId, id } = await params;
  let matchLogs = await getLogsOfMatch(matchId);
  const match = await getMatchById(matchId);
  if (isActionError(match)) {
    return <div className="text-red-500">Error fetching match data</div>;
  }

  if (isActionError(matchLogs)) matchLogs = [];

  const isAdmin = await isEventAdmin(id);
  if (isActionError(isAdmin))
    return <div className="text-red-500">Error checking admin status</div>;

  const tournamentTeamCount = await getTournamentTeamCount(id);
  const maxRounds = Math.ceil(tournamentTeamCount / 2);

  const visualizerUrl = `${process.env.NEXT_PUBLIC_VISUALIZER_URL}/?replay=https://core-replays.object.storage.eu01.onstackit.cloud/${matchId}/replay.json&mode=${match.phase}&round=${match.round}&maxRounds=${maxRounds}`;

  return (
    <div className="space-y-8">
      {/* Header with open in new tab button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Match Visualizer</h2>
        <Button
          size="sm"
          variant="bordered"
          startContent={<ArrowTopRightOnSquareIcon className="h-4 w-4" />}
          onPress={() => window.open(visualizerUrl, '_blank')}
          aria-label="Open visualizer in new tab"
        >
          Open in New Tab
        </Button>
      </div>
      
      {/* Iframe container */}
      <div className="relative w-full h-[750px] rounded-md overflow-hidden border border-gray-200">
        <iframe
          src={visualizerUrl}
          className="w-full h-full"
          title="Match Visualizer"
          allow="fullscreen"
        />
      </div>

      {isAdmin && <MatchActions matchId={matchId} />}
      <MatchLogsDisplay logs={matchLogs} />
    </div>
  );
}
