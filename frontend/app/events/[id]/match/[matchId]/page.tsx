import {
  getLogsOfMatch,
  getMatchById,
  getTournamentTeamCount,
} from "@/app/actions/tournament";
import MatchLogsDisplay from "@/components/match/MatchLogsDisplay";
import { isActionError } from "@/app/actions/errors";
import { isEventAdmin } from "@/app/actions/event";
import MatchActions from "@/app/events/[id]/match/[matchId]/matchActions";

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
      {/* Iframe container with in-frame-style overlay control */}
      <div className="relative w-full h-[750px] rounded-md overflow-hidden border border-gray-200">
        <iframe
          src={visualizerUrl}
          className="w-full h-full"
          title="Match Visualizer"
          allow="fullscreen"
        />
        {/* Bottom-right overlay button styled like a fullscreen icon */}
        <a
          href={visualizerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-md bg-black/60 text-white shadow-md backdrop-blur-sm hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          aria-label="Open visualizer in a new tab"
          title="Open visualizer in a new tab"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M4 9V4h5" />
            <path d="M20 9V4h-5" />
            <path d="M4 15v5h5" />
            <path d="M20 15v5h-5" />
          </svg>
        </a>
      </div>

      {isAdmin && <MatchActions matchId={matchId} />}
      <MatchLogsDisplay logs={matchLogs} />
    </div>
  );
}
