import React from "react";
import { notFound } from "next/navigation";
import { Card } from "@/components/clientHeroui";
import { getTeamById, getTeamMembers } from "@/app/actions/team";
import TeamUserTable from "./TeamUserTable";
import BackButton from "./BackButton";

interface TeamDetailPageProps {
  params: Promise<{
    id: string;
    teamId: string;
  }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId, id } = await params;

  const members = await getTeamMembers(teamId);
  const teamInfo = await getTeamById(teamId);
  if (!teamInfo || !members) {
    notFound();
  }

  return (
    <div className="py-8 space-y-8">
      <Card className="p-6">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold">Team {teamInfo.name}</h1>
          </div>
        </div>
        <TeamUserTable members={members} />
      </Card>
    </div>
  );
}
