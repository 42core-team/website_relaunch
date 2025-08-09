# GitHub API Client

A lightweight, TypeScript-based GitHub API client that implements best practices from the [GitHub REST API documentation](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api).

## Features

- 🚦 **Automatic Rate Limit Handling**: Detects rate limits and automatically retries after the reset time
- 🔄 **Retry Mechanism**: Implements exponential backoff with jitter for failed requests
- 🔑 **Authentication**: Supports GitHub personal access tokens
- 📝 **Type Safety**: Written in TypeScript with comprehensive type definitions
- 🧩 **Modular Design**: Separate modules for different API endpoints

## Usage

### Basic Setup

```typescript
import { GitHubApiClient } from "./utils/github-api";

// Create a GitHub API client
const githubClient = new GitHubApiClient({
  token: process.env.GITHUB_TOKEN, // Personal access token
  userAgent: "My-App/1.0.0", // Custom user agent
});
```

### Making API Requests

```typescript
// Direct API requests
const user = await githubClient.get("users/octocat");
const repo = await githubClient.get("repos/octocat/hello-world");

// POST request
const newIssue = await githubClient.post("repos/octocat/hello-world/issues", {
  title: "Found a bug",
  body: "This is a bug report",
});
```

### Using Endpoint Classes

```typescript
import { GitHubApiClient, RepositoryApi, UserApi } from "./utils/github-api";

// Create a GitHub API client
const githubClient = new GitHubApiClient({
  token: process.env.GITHUB_TOKEN,
});

// Create API instances
const repoApi = new RepositoryApi(githubClient);
const userApi = new UserApi(githubClient);

// Get repository information
const repo = await repoApi.getRepository("octocat", "hello-world");

// List issues
const issues = await repoApi.listIssues("octocat", "hello-world", {
  state: "open",
  sort: "created",
  direction: "desc",
  per_page: 10,
});

// Get user information
const user = await userApi.getUser("octocat");

// List repositories
const repos = await userApi.listUserRepositories("octocat", {
  sort: "updated",
  direction: "desc",
});
```

### Creating and Deleting Repositories

```typescript
import { GitHubApiClient, RepositoryApi } from "./utils/github-api";

// Create a GitHub API client
const githubClient = new GitHubApiClient({
  token: process.env.GITHUB_TOKEN,
});

// Create repository API instance
const repoApi = new RepositoryApi(githubClient);

// Create a new repository for the authenticated user
const newRepo = await repoApi.createRepo({
  name: "my-new-repo",
  description: "A repository created via the GitHub API",
  private: true,
  auto_init: true,
  gitignore_template: "Node",
  license_template: "mit",
});
console.log(`Repository created: ${newRepo.full_name}`);
console.log(`URL: ${newRepo.html_url}`);

// Create a new repository in an organization
const orgRepo = await repoApi.createRepo(
  {
    name: "org-repo",
    description: "A repository created in an organization",
    private: true,
  },
  "my-organization",
);
console.log(`Organization repository created: ${orgRepo.full_name}`);

// Create a repository from a template
const templateOwner = "template-owner";
const templateRepo = "template-repo";
const newRepoFromTemplate = await repoApi.createRepoFromTemplate(
  templateOwner,
  templateRepo,
  {
    owner: "my-username",
    name: "repo-from-template",
    description: "A repository created from a template",
    private: true,
    include_all_branches: false,
  },
);
console.log(
  `Repository created from template: ${newRepoFromTemplate.full_name}`,
);

// Delete a repository
await repoApi.deleteRepo("owner", "repo-to-delete");
console.log("Repository deleted successfully");
```

### Managing Repository Collaborators

```typescript
import { GitHubApiClient, RepositoryApi } from "./utils/github-api";

// Create a GitHub API client
const githubClient = new GitHubApiClient({
  token: process.env.GITHUB_TOKEN,
});

// Create repository API instance
const repoApi = new RepositoryApi(githubClient);

// List collaborators
const collaborators = await repoApi.listCollaborators("owner", "repo");

// Check if a user is a collaborator
const isCollaborator = await repoApi.isCollaborator(
  "owner",
  "repo",
  "username",
);

// Get collaborator permission level
const permissionLevel = await repoApi.getCollaboratorPermissionLevel(
  "owner",
  "repo",
  "username",
);
console.log(`Permission: ${permissionLevel.permission}`);
console.log(`Role: ${permissionLevel.role_name}`);

// Invite a collaborator with specific permissions
const invitation = await repoApi.addCollaborator(
  "owner",
  "repo",
  "username",
  "maintain",
);
console.log(`Invitation ID: ${invitation.id}`);

// Update a collaborator's permissions
await repoApi.updateCollaboratorPermission(
  "owner",
  "repo",
  "username",
  "admin",
);

// Remove a collaborator
await repoApi.removeCollaborator("owner", "repo", "username");

// List pending invitations
const invitations = await repoApi.listInvitations("owner", "repo");

// Delete an invitation
await repoApi.deleteInvitation("owner", "repo", invitationId);
```

### Managing User Invitations

```typescript
import { GitHubApiClient, UserApi } from "./utils/github-api";

// Create a GitHub API client
const githubClient = new GitHubApiClient({
  token: process.env.GITHUB_TOKEN,
});

// Create user API instance
const userApi = new UserApi(githubClient);

// List repository invitations for the authenticated user
const invitations = await userApi.listRepositoryInvitations();

// Accept a specific invitation by ID
await userApi.acceptRepositoryInvitation(invitationId);

// Accept a specific invitation by repository name
const accepted = await userApi.acceptRepositoryInvitationByRepo(
  "owner",
  "repo",
);
if (accepted) {
  console.log("Invitation accepted successfully");
} else {
  console.log("No invitation found for this repository");
}

// Accept all pending invitations
const acceptedCount = await userApi.acceptAllRepositoryInvitations();
console.log(`Accepted ${acceptedCount} invitations`);

// Decline an invitation
await userApi.declineRepositoryInvitation(invitationId);
```

### Managing Invitations with User-Provided Access Token

You can also accept invitations on behalf of a specific user by providing their access token:

```typescript
import { GitHubApiClient, UserApi } from "./utils/github-api";

// Create a GitHub API client
const githubClient = new GitHubApiClient();

// Create user API instance
const userApi = new UserApi(githubClient);

// User's personal access token
const userAccessToken = "user-provided-access-token";

// List repository invitations for a specific user
const invitations = await userApi.listRepositoryInvitations(userAccessToken);

// Accept a specific invitation by ID for a specific user
await userApi.acceptRepositoryInvitation(invitationId, userAccessToken);

// Accept a specific invitation by repository name for a specific user
const accepted = await userApi.acceptRepositoryInvitationByRepo(
  "owner",
  "repo",
  userAccessToken,
);

// Accept all pending invitations for a specific user
const acceptedCount =
  await userApi.acceptAllRepositoryInvitations(userAccessToken);
console.log(`Accepted ${acceptedCount} invitations for the user`);

// Decline an invitation for a specific user
await userApi.declineRepositoryInvitation(invitationId, userAccessToken);
```

This is particularly useful for applications that need to accept invitations on behalf of users, such as:

- OAuth applications that have user tokens
- GitHub Apps that generate user tokens
- Multi-user systems where you store user tokens

## Best Practices Implemented

1. **Conditional Requests**: Uses proper headers for API versioning
2. **Rate Limiting**: Automatically handles rate limits by waiting for the reset time
3. **User Agent**: Sets a custom user agent for API requests
4. **Authentication**: Supports token-based authentication
5. **Error Handling**: Properly handles and retries on errors
6. **Pagination**: Supports pagination parameters for list endpoints

## Configuration Options

The `GitHubApiClient` constructor accepts the following options:

```typescript
{
  baseUrl?: string;       // Default: 'https://api.github.com'
  token?: string;         // GitHub personal access token
  userAgent?: string;     // Default: 'GitHub-API-GraphView'
  maxRetries?: number;    // Default: 3
}
```

## Error Handling

The client automatically retries requests that fail due to rate limiting or network issues. After the maximum number of retries is reached, the error is thrown to the caller.

```typescript
try {
  const data = await githubClient.get("some/endpoint");
  // Process data
} catch (error) {
  console.error("API request failed:", error);
}
```
