import GraphView from "@/app/events/[id]/bracket/graphView";
import Actions from "@/app/events/[id]/bracket/actions";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const serializedMatches: any[] = [];

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
      <GraphView matches={serializedMatches} />
    </div>
  );
}
