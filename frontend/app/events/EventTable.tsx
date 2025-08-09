"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/react";
import Link from "next/link";
import { Event } from "@/app/actions/event";

export default function EventsTable({ events }: { events: Event[] }) {
  return (
    <div className="mt-8">
      <Table aria-label="Events table">
        <TableHeader>
          <TableColumn>Name</TableColumn>
          <TableColumn>Start Date</TableColumn>
          <TableColumn>Team Size</TableColumn>
        </TableHeader>
        <TableBody items={events} emptyContent="No events found">
          {(event) => (
            <TableRow
              key={event.id}
              className="cursor-pointer transition-colors hover:bg-default-100"
            >
              <TableCell>
                <Link href={`/events/${event.id}`} className="block w-full">
                  {event.name}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/events/${event.id}`} className="block w-full">
                  {new Date(event.startDate).toLocaleDateString()}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/events/${event.id}`} className="block w-full">
                  {event.minTeamSize} - {event.maxTeamSize} members
                </Link>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
