"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  createTeam,
  Team,
  leaveTeam,
  getTeamMembers,
  TeamMember,
} from "@/app/actions/team";
import {
  TeamCreationSection,
  TeamInfoSection,
  TeamInvitesSection,
} from "@/components/team";
import { isActionError } from "@/app/actions/errors";

export default function Page({ initialTeam }: { initialTeam: Team | null }) {
  const [myTeam, setMyTeam] = useState(initialTeam);
  const [newTeamName, setNewTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const eventId = useParams().id as string;
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch team members when team changes
  useEffect(() => {
    async function fetchTeamMembers() {
      if (myTeam) {
        try {
          const members = await getTeamMembers(myTeam.id);
          setTeamMembers(members);
        } catch (error) {
          console.error("Error fetching team members:", error);
        }
      }
    }

    fetchTeamMembers();
  }, [myTeam]);

  async function handleCreateTeam() {
    if (!newTeamName) {
      console.error("No team name provided");
      return;
    }

    if (!session || !session.user || !session.user.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const result = await createTeam(newTeamName, eventId);

      if (isActionError(result)) {
        setErrorMessage(result.error);
        return;
      }
      setMyTeam(result);
    } catch (err) {
      console.error("Error creating team:", err);
      setErrorMessage("An unexpected error occurred while creating the team.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLeaveTeam(): Promise<boolean> {
    if (!myTeam || !session || !session.user || !session.user.id) {
      console.error("No team to leave or user not authenticated");
      return false;
    }

    setIsLeaving(true);
    await leaveTeam(eventId);

    setMyTeam(null);
    setTeamMembers([]);
    return true;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!myTeam ? (
        <>
          <TeamCreationSection
            newTeamName={newTeamName}
            setNewTeamName={setNewTeamName}
            handleCreateTeam={handleCreateTeam}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
          <div className="mt-8"></div>
          <TeamInvitesSection />
        </>
      ) : (
        <TeamInfoSection
          myTeam={myTeam}
          onLeaveTeam={handleLeaveTeam}
          isLeaving={isLeaving}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
}
