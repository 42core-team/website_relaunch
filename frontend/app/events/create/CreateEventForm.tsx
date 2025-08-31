"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Card, Tooltip, Form } from "@heroui/react";
import { createEvent } from "@/app/actions/event";
import { isActionError } from "@/app/actions/errors";

async function validateGithubToken(
  orgName: string,
  token: string,
): Promise<string | null> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };

  try {
    // 1. Check if the token is valid and has access to the organization
    const orgResponse = await fetch(`https://api.github.com/orgs/${orgName}`, {
      headers,
    });
    if (!orgResponse.ok) {
      let errorMessage = `Failed to access GitHub organization: ${orgResponse.statusText}`;
      try {
        const errorBody = await orgResponse.json();
        if (errorBody && errorBody.message) {
          errorMessage = `GitHub API Error: ${errorBody.message}`;
        }
      } catch (jsonError) {
        // Ignore JSON parsing errors, use default message
      }
      if (orgResponse.status === 404) {
        return `Organization '${orgName}' not found or token has no access. ${errorMessage}`;
      }
      return errorMessage;
    }

    // 2. Check for repository creation permissions (by trying to list repos)
    const reposResponse = await fetch(
      `https://api.github.com/orgs/${orgName}/repos?type=all`,
      { headers },
    );
    if (!reposResponse.ok) {
      let errorMessage = `Token lacks permission to list repositories in '${orgName}'. Required: 'repo' scope.`;
      try {
        const errorBody = await reposResponse.json();
        if (errorBody && errorBody.message) {
          errorMessage = `GitHub API Error: ${errorBody.message}`;
        }
      } catch (jsonError) {
        // Ignore JSON parsing errors
      }
      return errorMessage;
    }

    // 3. Check for invitation permissions (by trying to list members)
    const membersResponse = await fetch(
      `https://api.github.com/orgs/${orgName}/members`,
      { headers },
    );
    if (!membersResponse.ok) {
      let errorMessage = `Token lacks permission to list members in '${orgName}'. Required: 'admin:org' or 'read:org' scope.`;
      try {
        const errorBody = await membersResponse.json();
        if (errorBody && errorBody.message) {
          errorMessage = `GitHub API Error: ${errorBody.message}`;
        }
      } catch (jsonError) {
        // Ignore JSON parsing errors
      }
      return errorMessage;
    }

    // 4. Content read and write scope is generally covered by repo creation/admin permissions.
    //    Directly checking 'contents' scope is not straightforward via REST API without trying to modify content.
    //    Assuming if repo creation is possible, content read/write is implicitly handled for new repos.

    return null; // Token is valid and has required permissions
  } catch (error) {
    console.error("GitHub token validation error:", error);
    return "An unexpected error occurred during GitHub token validation.";
  }
}

export default function CreateEventForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubOrg, setGithubOrg] = useState("");
  const [githubOrgSecret, setGithubOrgSecret] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(0);
  const [endDate, setEndDate] = useState(0);
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [repoTemplateOwner, setRepoTemplateOwner] = useState("42core-team");
  const [repoTemplateName, setRepoTemplateName] = useState("my-core-bot");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const validationError = await validateGithubToken(
      githubOrg,
      githubOrgSecret,
    );
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

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
      repoTemplateOwner: repoTemplateOwner,
      repoTemplateName: repoTemplateName,
    });

    if (isActionError(result)) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    router.push(`/events/${result.id}`);
  };

  return (
    <Form
      className="w-full justify-center items-center space-y-4"
      onSubmit={onSubmit}
    >
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-4 md:px-6">
        <Card className="w-full p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          <div className="flex flex-col gap-4">
            <Input
              isRequired
              label="Event Name"
              labelPlacement="outside"
              placeholder="Enter event name"
              value={name}
              onValueChange={(v) => setName(v.trim())}
            />

            <Textarea
              label="Description"
              labelPlacement="outside"
              placeholder="Enter event description"
              minRows={3}
              value={description}
              onValueChange={(v) => setDescription(v.trim())}
            />

            <Input
              label="Location"
              labelPlacement="outside"
              placeholder="Enter event location"
              value={location}
              onValueChange={(v) => setLocation(v.trim())}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                isRequired
                type="datetime-local"
                label="Start Date"
                labelPlacement="outside"
                onValueChange={(v) => setStartDate(new Date(v).getTime())}
              />
              <Input
                isRequired
                type="datetime-local"
                label="End Date"
                labelPlacement="outside"
                onValueChange={(v) => setEndDate(new Date(v).getTime())}
              />
            </div>
          </div>
        </Card>

        <Card className="w-full p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Team Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Input
              isRequired
              type="number"
              min={1}
              max={10}
              label="Min Team Size"
              labelPlacement="outside"
              className="w-full"
              value={minTeamSize.toString()}
              onValueChange={(v) => setMinTeamSize(parseInt(v || "0", 10))}
            />
            <Input
              isRequired
              type="number"
              min={minTeamSize}
              max={10}
              label="Max Team Size"
              labelPlacement="outside"
              className="w-full"
              value={maxTeamSize.toString()}
              onValueChange={(v) => setMaxTeamSize(parseInt(v || "0", 10))}
            />
          </div>
        </Card>

        <Card className="w-full p-6">
          <h2 className="text-xl font-semibold mb-4">GitHub Integration</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                isRequired
                label="Organization Name"
                labelPlacement="outside"
                placeholder="e.g. 42core-team"
                value={githubOrg}
                onValueChange={(v) => setGithubOrg(v.trim())}
              />
              <Input
                isRequired
                type="password"
                label={
                  <div className="flex items-center gap-1">
                    <span>GitHub Organization Secret</span>
                    <Tooltip
                      content={
                        <div className="text-xs text-default-500 p-2 max-w-xs">
                          The token needs the following permissions:
                          <ul className="list-disc list-inside ml-4">
                            <li>
                              <b>Administration:</b> Repository creation,
                              deletion, settings, teams, and collaborators.
                            </li>
                            <li>
                              <b>Contents:</b> Repository contents, commits,
                              branches, downloads, releases, and merges.
                            </li>
                          </ul>
                        </div>
                      }
                    >
                      <span className="cursor-pointer text-default-400 hover:text-default-600">
                        &#9432;
                      </span>
                    </Tooltip>
                  </div>
                }
                labelPlacement="outside"
                placeholder="github_pat_*"
                value={githubOrgSecret}
                onValueChange={(v) => setGithubOrgSecret(v.trim())}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                isRequired
                label="Template Owner"
                labelPlacement="outside"
                placeholder="e.g. 42core-team"
                value={repoTemplateOwner}
                onValueChange={(v) => setRepoTemplateOwner(v.trim())}
              />
              <Input
                isRequired
                label="Template Repository"
                labelPlacement="outside"
                placeholder="e.g. rush-template"
                value={repoTemplateName}
                onValueChange={(v) => setRepoTemplateName(v.trim())}
              />
            </div>
          </div>
        </Card>

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
      </div>
    </Form>
  );
}
