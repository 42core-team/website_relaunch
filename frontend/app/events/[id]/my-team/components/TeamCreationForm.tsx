"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createTeam } from "@/app/actions/team";
import { TeamCreationSection } from "@/components/team";
import { isActionError } from "@/app/actions/errors";

export default function TeamCreationForm() {
  const [newTeamName, setNewTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const eventId = useParams().id as string;
  const router = useRouter();

  async function handleCreateTeam() {
    if (!newTeamName) {
      console.error("No team name provided");
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

      // Use Next.js router to refresh the page
      router.refresh();
    } catch (err) {
      console.error("Error creating team:", err);
      setErrorMessage("An unexpected error occurred while creating the team.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <TeamCreationSection
      newTeamName={newTeamName}
      setNewTeamName={setNewTeamName}
      handleCreateTeam={handleCreateTeam}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
}
