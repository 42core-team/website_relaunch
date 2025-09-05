import Actions from "@/app/events/[id]/groups/actions";
import { getSwissMatches } from "@/app/actions/tournament";
import GraphView from "@/app/events/[id]/groups/graphView";

export const metadata = {
  title: "Group Phase",
  description:
    "In the group phase, teams compete using the Swiss tournament system, with rankings determined by the Buchholz scoring system.",
};

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const matches = await getSwissMatches((await params).id);

  return (
    <div>
      <div className="flex gap-2">
        <Actions />
      </div>
      <h1>Group phase</h1>
      <p>
        In the group phase, teams compete using the Swiss tournament system,
        with rankings determined by the Buchholz scoring system.
      </p>
      <GraphView matches={matches} />
    </div>
  );
}
