import { Card } from "@/components/clientHeroui";
import {
  getEventById,
  getTeamsCountForEvent,
  getParticipantsCountForEvent,
} from "@/app/actions/event";
import { isActionError } from "@/app/actions/errors";
import RepoLockCountdown from "@/app/events/[id]/repoLockCountdown";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await getEventById(id);
  if (isActionError(event)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>No event data found</p>
      </div>
    );
  }

  const teamsCount = await getTeamsCountForEvent(id);
  const participantsCount = await getParticipantsCountForEvent(id);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{event.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Participants</h3>
          <p className="text-3xl font-bold">{participantsCount}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Teams</h3>
          <p className="text-3xl font-bold">{teamsCount}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Location</h3>
          <p className="text-xl">{event.location || "TBA"}</p>
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Event Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1">{event.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
              <p className="mt-1">
                {new Date(event.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">End Date</h3>
              <p className="mt-1">
                {new Date(event.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Team Size</h3>
              <p className="mt-1">
                {event.minTeamSize} - {event.maxTeamSize} members
              </p>
            </div>
            {event.repoLockDate && (
              <RepoLockCountdown repoLockDate={event.repoLockDate} />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
