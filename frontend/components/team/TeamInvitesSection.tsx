import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { useSession } from "next-auth/react";
import {
  TeamInviteWithDetails,
  getUserPendingInvites,
  acceptTeamInvite,
  declineTeamInvite,
} from "@/app/actions/team";
import { isActionError } from "@/app/actions/errors";

export const TeamInvitesSection = () => {
  const [invites, setInvites] = useState<TeamInviteWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionStates, setActionStates] = useState<
    Record<
      string,
      {
        isAccepting: boolean;
        isDeclining: boolean;
        message?: string;
      }
    >
  >({});
  const eventId = useParams().id as string;
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function fetchInvites() {
      try {
        // @ts-ignore
        const userInvites = await getUserPendingInvites(eventId);
        setInvites(userInvites);
      } catch (error) {
        console.error("Error fetching invites:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user?.id) {
      setIsLoading(true);
      fetchInvites().finally(() => setIsLoading(false));
    }
  }, [session]);

  const handleAcceptInvite = async (teamId: string) => {
    if (!session?.user?.id) {
      console.error("User not authenticated");
      return;
    }

    setActionStates((prev) => ({
      ...prev,
      [teamId]: { ...prev[teamId], isAccepting: true, message: undefined },
    }));

    const result = await acceptTeamInvite(eventId, teamId);

    if (isActionError(result)) {
      setActionStates((prev) => ({
        ...prev,
        [teamId]: {
          ...prev[teamId],
          isAccepting: false,
          message: result.error,
        },
      }));
      return;
    }

    setInvites((prev) => prev.filter((invite) => invite.id !== teamId));
    window.location.reload();
  };

  const handleDeclineInvite = async (teamId: string) => {
    if (!session?.user?.id) {
      console.error("User not authenticated");
      return;
    }

    setActionStates((prev) => ({
      ...prev,
      [teamId]: { ...prev[teamId], isDeclining: true, message: undefined },
    }));

    await declineTeamInvite(eventId, teamId);
    setInvites((prev) => prev.filter((invite) => invite.id !== teamId));
  };

  if (isLoading) {
    return null;
  }

  if (invites.length === 0) {
    return null;
  }

  return (
    <div className="bg-default-50 p-6 rounded-lg border border-default-200 mb-6">
      <h2 className="text-xl font-semibold mb-4">Team Invitations</h2>
      <div className="divide-y divide-default-200">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="py-3 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{invite.teamName}</p>
              <p className="text-sm text-default-500">
                Invited {new Date(invite.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {actionStates[invite.id]?.message && (
                <span className="text-danger text-sm mr-2">
                  {actionStates[invite.id]?.message}
                </span>
              )}
              <Button
                color="primary"
                size="sm"
                isLoading={actionStates[invite.id]?.isAccepting}
                isDisabled={actionStates[invite.id]?.isDeclining}
                onPress={() => handleAcceptInvite(invite.id)}
              >
                Accept
              </Button>
              <Button
                color="default"
                size="sm"
                variant="light"
                isLoading={actionStates[invite.id]?.isDeclining}
                isDisabled={actionStates[invite.id]?.isAccepting}
                onPress={() => handleDeclineInvite(invite.id)}
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamInvitesSection;
