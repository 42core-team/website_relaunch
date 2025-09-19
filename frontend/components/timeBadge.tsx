"use client";

import { Chip } from "@heroui/react";

export default function TimeBadge({
  time,
  className = "",
}: {
  time: string | Date;
  className?: string;
}) {
  const date = new Date(time);
  const formatted = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Chip variant="faded" color="success" className={className}>
      {" "}
      {formatted}
    </Chip>
  );
}
