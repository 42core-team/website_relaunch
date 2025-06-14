import GraphView from "@/app/events/[id]/groups/graphView";
import Actions from "@/app/events/[id]/groups/actions";
import { notFound } from "next/navigation";
import { prisma } from "@/initializer/database";
import {
  events_type_enum,
  Match,
  matches_phase_enum,
} from "@/generated/prisma";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const serializedMatches = [];

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
      {/*<GraphView matches={serializedMatches as Match} />*/}
    </div>
  );
}
