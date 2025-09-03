import GraphView from "@/app/events/[id]/bracket/graphView";
import Actions from "@/app/events/[id]/bracket/actions";
import {
  getTournamentMatches,
  getTournamentTeamCount,
} from "@/app/actions/tournament";
import { Match } from "@/app/actions/tournament-model";

export const metadata = {
  title: "Tournament Bracket",
  description: "View the tournament bracket and match results.",
};

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const eventId = (await params).id;
  const serializedMatches: Match[] = await getTournamentMatches(eventId);
  const teamCount = await getTournamentTeamCount(eventId);

  return (
    <div>
      <div className="flex gap-2">
        <Actions />
      </div>
      <h1>Tournament Tree</h1>
      <p></p>
      <GraphView matches={serializedMatches} teamCount={teamCount} />
    </div>
  );
}
