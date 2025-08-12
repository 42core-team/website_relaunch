"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Team, TeamMember, leaveTeam } from "@/app/actions/team";
import { TeamInfoSection } from "@/components/team";
import { isActionError } from "@/app/actions/errors";

interface TeamInfoDisplayProps {
  team: Team;
  teamMembers: TeamMember[];
}

export default function TeamInfoDisplay({
  team,
  teamMembers,
}: TeamInfoDisplayProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const eventId = useParams().id as string;
  const router = useRouter();

  async function handleLeaveTeam(): Promise<boolean> {
    setIsLeaving(true);
    setErrorMessage(null);

    const result = await leaveTeam(eventId);
    if (isActionError(result)) {
      setErrorMessage(result.error);
      setIsLeaving(false);
      return false;
    }

    // Use Next.js router to refresh the page
    router.refresh();
    return true;
  }

  return (
    <>
      {errorMessage && (
        <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      <TeamInfoSection
        myTeam={team}
        onLeaveTeam={handleLeaveTeam}
        isLeaving={isLeaving}
        teamMembers={teamMembers}
      />
    </>
  );
}
