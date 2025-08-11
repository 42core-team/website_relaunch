import { getLogsOfMatch } from "@/app/actions/tournament";
import MatchLogsDisplay from "@/components/match/MatchLogsDisplay";
import { isActionError } from "@/app/actions/errors";
import { isEventAdmin } from "@/app/actions/event";
import MatchActions from "@/app/events/[id]/match/[matchId]/matchActions";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const matchId = (await params).matchId;
  let matchLogs = await getLogsOfMatch(matchId);

  if (isActionError(matchLogs)) matchLogs = [];

  const isAdmin = await isEventAdmin(matchId);
  if (isActionError(isAdmin))
    return <div className="text-red-500">Error checking admin status</div>;

  const visualizerUrl = `https://dev.visualizer.coregame.de/?replay=https://core-replays.object.storage.eu01.onstackit.cloud/${matchId}/replay.json`;

  return (
    <div className="space-y-8">
      <div className="w-full h-[600px] rounded-md overflow-hidden border border-gray-200">
        <iframe
          src={visualizerUrl}
          className="w-full h-full"
          title="Match Visualizer"
          allow="fullscreen"
        />
      </div>

      <MatchActions matchId={matchId} />

      <MatchLogsDisplay logs={matchLogs} />
    </div>
  );
}
