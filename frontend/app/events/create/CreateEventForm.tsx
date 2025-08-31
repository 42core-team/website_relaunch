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

      <Card className="p-6 flex flex-col gap-4 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Event Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.trim())}
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
              onChange={(e) => setDescription(e.target.value.trim())}
              placeholder="Enter event description"
              minRows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value.trim())}
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
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Team Settings</h2>
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
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">GitHub Integration</h2>
        <div className="space-y-4">
          <div>
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
                  onChange={(e) => setGithubOrg(e.target.value.trim())}
                  placeholder="e.g. 42core-team"
                />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <label className="block text-sm font-medium mb-1">
                    GitHub Organization Secret
                  </label>
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
                      &#9432; {/* Info icon character */}
                    </span>
                  </Tooltip>
                </div>
                <Input
                  required={true}
                  value={githubOrgSecret}
                  type="password"
                  placeholder="github_pat_*"
                  onChange={(e) => setGithubOrgSecret(e.target.value.trim())}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">
                GitHub Repository Template
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Template Owner
                </label>
                <Input
                  required={true}
                  value={repoTemplateOwner}
                  onChange={(e) => setRepoTemplateOwner(e.target.value.trim())}
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
                  onChange={(e) => setRepoTemplateName(e.target.value.trim())}
                  placeholder="e.g. rush-template"
                />
              </div>
            </div>
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
    </Form>
  );
}
