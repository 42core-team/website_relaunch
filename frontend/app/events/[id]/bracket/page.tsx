import GraphView from "@/app/events/[id]/bracket/graphView";
import Actions from "@/app/events/[id]/bracket/actions";
import { getTournamentTeamCount } from "@/app/actions/tournament";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const eventId = (await params).id;
  const serializedMatches: any[] = [];
  const teamCount = await getTournamentTeamCount(eventId);

  return (
    <div>
      <div className="flex gap-2">
        <Actions />
      </div>
      <h1>Group phase</h1>
      <p>
        Group phase is the first phase of the tournament where teams are divided
        into groups and play against each other.
      </p>
      <GraphView matches={serializedMatches} teamCount={teamCount} />
    </div>
  );
}
