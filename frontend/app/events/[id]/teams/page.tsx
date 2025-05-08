import { notFound } from "next/navigation";
import { Card } from "@/components/clientHeroui";
import { getTeamsForEventTable, Team } from "@/app/actions/team";
import TeamsSearchBar from "./TeamsSearchBar";
import TeamsTable from "./TeamsTable";

type TeamsPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function sortTeams(teams: Team[], column: string, direction: string) {
  return [...teams].sort((a, b) => {
    const first = a[column as keyof Team];
    const second = b[column as keyof Team];
    if (first === undefined || second === undefined) return 0;
    const cmp = first < second ? -1 : first > second ? 1 : 0;
    return direction === "descending" ? -cmp : cmp;
  });
}

function filterTeams(teams: Team[], filterValue: string) {
  if (!filterValue.trim()) return teams;
  return teams.filter(
    (team) =>
      team.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      (team.repo &&
        team.repo.toLowerCase().includes(filterValue.toLowerCase())),
  );
}

export default async function TeamsPage({
  params,
  searchParams,
}: TeamsPageProps) {
  const eventId = (await params).id;
  const searchParamsObj = await searchParams;
  if (!eventId || !searchParamsObj) return notFound();

  // Get filter/sort from query params
  const filterValue =
    typeof searchParamsObj?.q === "string" ? searchParamsObj.q : "";
  const allowedSortColumns = ["name", "createdAt", "membersCount"] as const;
  const sortColumn =
    typeof searchParamsObj?.sort === "string" &&
    allowedSortColumns.includes(searchParamsObj.sort as any)
      ? (searchParamsObj.sort as "name" | "createdAt" | "membersCount")
      : "name";
  // Map "ascending"/"descending" to "asc"/"desc"
  let sortDirection: "asc" | "desc" | undefined;
  if (typeof searchParamsObj?.dir === "string") {
    if (searchParamsObj.dir === "ascending") sortDirection = "asc";
    else if (searchParamsObj.dir === "descending") sortDirection = "desc";
    else sortDirection = undefined;
  } else {
    sortDirection = "asc";
  }

  // Fetch teams server-side
  const teams = await getTeamsForEventTable(
    eventId,
    filterValue,
    sortColumn,
    sortDirection,
  );

  // For client-side sort, map back to "ascending"/"descending" for compatibility
  const clientSortDirection =
    sortDirection === "desc" ? "descending" : "ascending";

  return (
    <div className="py-8 space-y-8">
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Teams</h1>
            <TeamsSearchBar
              initialValue={filterValue}
              sortColumn={sortColumn}
              sortDirection={clientSortDirection}
            />
          </div>
          <TeamsTable teams={teams} eventId={eventId} />
        </div>
      </Card>
    </div>
  );
}
