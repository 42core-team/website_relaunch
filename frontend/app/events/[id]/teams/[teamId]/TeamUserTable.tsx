"use client";

import { TeamMember } from "@/app/actions/team";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
} from "@heroui/react";
import Link from "next/link";

export default function TeamUserTable({ members }: { members: TeamMember[] }) {
  return (
    <Table aria-label="Team members table">
      <TableHeader>
        <TableColumn>Member</TableColumn>
        <TableColumn>Username</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No team members found" items={members}>
        {(member) => (
          <TableRow key={member.id}>
            <TableCell>
              <Link
                href={`https://github.com/${member.username}`}
                className="flex items-center gap-3"
              >
                <Avatar
                  src={member.profilePicture}
                  name={member.name}
                  size="sm"
                />
                <span>{member.name}</span>
              </Link>
            </TableCell>
            <TableCell>@{member.username}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
