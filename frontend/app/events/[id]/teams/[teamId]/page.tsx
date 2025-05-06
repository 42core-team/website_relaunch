"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Spinner,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
} from "@heroui/react";
import { ArrowLeftIcon } from "@/components/icons";
import { Team, getTeamById, getTeamMembers } from "@/app/actions/team";
import { useSession } from "next-auth/react";

interface TeamMember {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
}

export default function TeamDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const teamId = params.teamId as string;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamInfo, setTeamInfo] = useState<Team | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (status === "loading") return;

      try {
        setIsLoading(true);
        const membersData = await getTeamMembers(teamId);
        setMembers(membersData);

        const team = await getTeamById(teamId);
        setTeamInfo(team);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <Card className="p-6">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-4">
            <Button
              onPress={() => router.back()}
              variant="ghost"
              className="p-2"
              aria-label="Back to teams list"
            >
              <ArrowLeftIcon size={20} />
            </Button>
            <h1 className="text-2xl font-bold">Team {teamInfo?.name}</h1>
          </div>
        </div>
        <Table aria-label="Team members table">
          <TableHeader>
            <TableColumn>Member</TableColumn>
            <TableColumn>Username</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No team members found" items={members}>
            {(member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.profilePicture}
                      name={member.name}
                      size="sm"
                    />
                    <span>{member.name}</span>
                  </div>
                </TableCell>
                <TableCell>@{member.username}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
