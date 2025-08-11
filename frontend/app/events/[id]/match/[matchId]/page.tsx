import { getLogsOfMatch } from "@/app/actions/tournament";
import MatchLogsDisplay from "@/components/match/MatchLogsDisplay";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const matchId = (await params).matchId;
  const matchLogs = await getLogsOfMatch(matchId);

  const visualizerUrl = `https://dev.visualizer.coregame.de/?replay=https://core-replays.object.storage.eu01.onstackit.cloud/core-replays/${matchId}/replay.json`;

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

      <MatchLogsDisplay logs={matchLogs} />
    </div>
  );
}
