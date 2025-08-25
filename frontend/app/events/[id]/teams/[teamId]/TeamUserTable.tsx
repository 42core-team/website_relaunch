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
import Image from "next/image";
import { GithubIcon } from "@/components/icons";

export default function TeamUserTable({ members }: { members: TeamMember[] }) {
  return (
    <Table aria-label="Team members table">
      <TableHeader>
        <TableColumn>Member</TableColumn>
        <TableColumn>
          <div className="flex items-center gap-1">
            <GithubIcon size={16} className="text-black dark:text-white" />
            <span>GitHub</span>
          </div>
        </TableColumn>
        <TableColumn>
          <div className="flex items-center gap-1">
            <Image src="/42-logo.svg" alt="42" width={16} height={16} />
            <span>Intra</span>
          </div>
        </TableColumn>
      </TableHeader>
      <TableBody emptyContent="No team members found" items={members}>
        {(member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar
                  src={member.profilePicture}
                  name={member.name}
                  size="sm"
                />
                <span>{member.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Link
                href={`https://github.com/${member.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit hover:underline"
              >
                @{member.username}
              </Link>
            </TableCell>
            <TableCell>
              {member.intraUsername ? (
                <Link
                  href={`https://profile.intra.42.fr/users/${member.intraUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-inherit hover:underline"
                >
                  {member.intraUsername}
                </Link>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
