"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Team, TeamMember, leaveTeam } from "@/app/actions/team";
import { TeamInfoSection } from "@/components/team";
import { isActionError } from "@/app/actions/errors";
import { usePlausible } from "next-plausible";

interface TeamInfoDisplayProps {
  team: Team;
  teamMembers: TeamMember[];
}

export default function TeamInfoDisplay({
  team,
  teamMembers,
}: TeamInfoDisplayProps) {
  const plausible = usePlausible();

  const [isLeaving, setIsLeaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRepoPending, setIsRepoPending] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef<number>(0);
  const delayRef = useRef<number>(500); // start at 0.5s
  const eventId = useParams().id as string;
  const router = useRouter();

  useEffect(() => {
    function clearTimer() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    function scheduleNext() {
      timeoutRef.current = setTimeout(() => {
        // If repo appeared in the meantime, stop
        if (team?.repo) {
          setIsRepoPending(false);
          clearTimer();
          return;
        }

        attemptsRef.current += 1;
        router.refresh();

        const maxAttempts = 8; // ~2 minutes total (0.5s → ~127.5s cumulative)
        if (attemptsRef.current >= maxAttempts) {
          setIsRepoPending(false);
          clearTimer();
          return;
        }

        // exponential backoff
        delayRef.current = delayRef.current * 1.5;
        scheduleNext();
      }, delayRef.current);
    }

    if (!team?.repo) {
      setIsRepoPending(true);
      // reset counters when repo missing
      attemptsRef.current = 0;
      delayRef.current = 1000;
      scheduleNext();
    } else {
      setIsRepoPending(false);
      clearTimer();
    }

    return () => {
      clearTimer();
    };
    // Only depend on repo presence and eventId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team?.repo, eventId]);

  async function handleLeaveTeam(): Promise<boolean> {
    plausible("leave_team");
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
        isRepoPending={isRepoPending}
      />
    </>
  );
}
