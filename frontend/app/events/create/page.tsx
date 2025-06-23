"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Textarea,
  Card,
  Select,
  SelectItem,
  Chip,
} from "@heroui/react";
import { title } from "@/components/primitives";
import { createEvent, canUserCreateEvent } from "@/app/actions/event";
import { isActionError } from "@/app/actions/errors";

export default function CreateEventPage() {
  const { status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubOrg, setGithubOrg] = useState("42core-team");
  const [githubOrgSecret, setGithubOrgSecret] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(0);
  const [endDate, setEndDate] = useState(0);
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [treeFormat, setTreeFormat] = useState(16);
  const [repoTemplateOwner, setRepoTemplateOwner] = useState("");
  const [repoTemplateName, setRepoTemplateName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkPermission() {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/events");
        return;
      }

      const hasPermission = await canUserCreateEvent();
      if (!hasPermission) {
        router.push("/events");
        return;
      }

      setIsCheckingPermission(false);
    }

    checkPermission();
  }, [status, router]);

  if (status === "loading" || isCheckingPermission) {
    return <div className="text-center">Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await createEvent({
      name,
      description,
      githubOrg,
      githubOrgSecret,
      location,
      startDate,
      endDate,
      minTeamSize,
      maxTeamSize,
      treeFormat,
      repoTemplateOwner: repoTemplateOwner,
      repoTemplateName: repoTemplateName,
    });

    if (isActionError(result)) {
      setError(result.error);
      return;
    }

    router.push(`/events/${result.id}`);
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>Create New Event</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Event Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter event name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              minRows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter event location"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <Input
                type="datetime-local"
                onChange={(e) =>
                  setStartDate(new Date(e.target.value).getTime())
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="datetime-local"
                onChange={(e) => setEndDate(new Date(e.target.value).getTime())}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Min Team Size
              </label>
              <Input
                type="number"
                min={1}
                max={10}
                value={minTeamSize.toString()}
                onChange={(e) => setMinTeamSize(parseInt(e.target.value, 10))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Team Size
              </label>
              <Input
                type="number"
                min={minTeamSize}
                max={10}
                value={maxTeamSize.toString()}
                onChange={(e) => setMaxTeamSize(parseInt(e.target.value, 10))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Elimination Tournament Size
            </label>
            <Select
              value={treeFormat.toString()}
              onChange={(value) =>
                setTreeFormat(parseInt(value.toString(), 10))
              }
              placeholder="Select tournament size"
              disableAnimation
            >
              <SelectItem key="16">16 Teams</SelectItem>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">
                GitHub Organization
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Organization Name
                </label>
                <Input
                  required={true}
                  value={githubOrg}
                  onChange={(e) => setGithubOrg(e.target.value)}
                  placeholder="e.g. 42core-team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  GitHub Organization Secret
                </label>
                <Input
                  required={true}
                  value={githubOrgSecret}
                  type="password"
                  onChange={(e) => setGithubOrgSecret(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">
                GitHub Repository Template
              </label>
              <Chip color="warning" size="sm">
                Only available for Core team templates
              </Chip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Template Owner
                </label>
                <Input
                  required={true}
                  value={repoTemplateOwner}
                  onChange={(e) => setRepoTemplateOwner(e.target.value)}
                  placeholder="e.g. 42core-team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Template Repository
                </label>
                <Input
                  required={true}
                  value={repoTemplateName}
                  onChange={(e) => setRepoTemplateName(e.target.value)}
                  placeholder="e.g. rush-template"
                />
              </div>
            </div>
            <p className="text-xs text-default-500">
              Repository templates allow you to provide a starter code for
              participants. Currently, this feature is only available for events
              hosted by the Core team.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="light"
              onPress={() => router.push("/events")}
            >
              Cancel
            </Button>
            <Button type="submit" color="primary" isLoading={isLoading}>
              Create Event
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
