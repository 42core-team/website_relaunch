"use client";

import React from "react";
import { Select, SelectItem } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { WikiVersion } from "@/lib/markdown";

interface VersionSelectorProps {
  versions: WikiVersion[];
  currentVersion: string;
}

export function VersionSelector({
  versions,
  currentVersion,
}: VersionSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleVersionChange = (version: string) => {
    // Parse current path to extract the page slug
    const pathParts = pathname.split("/").filter(Boolean);

    if (pathParts[0] === "wiki") {
      // Remove 'wiki' from the path
      pathParts.shift();

      // Remove current version if it exists
      if (
        pathParts.length > 0 &&
        versions.some((v) => v.slug === pathParts[0])
      ) {
        pathParts.shift();
      }

      // For version switching, try the same page first, fallback to version home
      if (version === "latest") {
        // For latest, we don't include version in URL
        const newPath =
          pathParts.length > 0 ? `/wiki/${pathParts.join("/")}` : "/wiki";
        router.push(newPath);
      } else {
        // For specific versions, include version in URL
        // Try to maintain the same page, but fallback to version home if needed
        const newPath =
          pathParts.length > 0
            ? `/wiki/${version}/${pathParts.join("/")}`
            : `/wiki/${version}`;
        router.push(newPath);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-default-600 hidden sm:inline">
        Version:
      </span>
      <Select
        size="sm"
        selectedKeys={[currentVersion]}
        onSelectionChange={(keys) => {
          const selectedVersion = Array.from(keys)[0] as string;
          if (selectedVersion && selectedVersion !== currentVersion) {
            handleVersionChange(selectedVersion);
          }
        }}
        className="w-32 sm:w-40"
        aria-label="Select version"
      >
        {versions.map((version) => (
          <SelectItem key={version.slug}>{version.name}</SelectItem>
        ))}
      </Select>
    </div>
  );
}
