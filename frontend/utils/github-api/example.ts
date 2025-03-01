import { 
  GitHubApiClient, 
  RepositoryApi, 
  UserApi, 
  GitHubRepository, 
  GitHubIssue, 
  GitHubUser,
  GitHubRateLimit,
  GitHubRepositoryInvitation,
  GitHubCollaboratorPermission
} from './';

/**
 * Example of using the GitHub API client
 */
async function githubApiExample() {
  // Create a GitHub API client
  const githubClient = new GitHubApiClient({
    // Get token from environment variable
    token: process.env.GITHUB_TOKEN,
    // Set a custom user agent
    userAgent: 'GitHub-API-Example/1.0.0',
    // Set maximum number of retries
    maxRetries: 3,
  });

  // Create API instances
  const repoApi = new RepositoryApi(githubClient);
  const userApi = new UserApi(githubClient);

  try {
    // Example 1: Get repository information
    console.log('Fetching repository information...');
    const repo: GitHubRepository = await repoApi.getRepository('octocat', 'hello-world');
    console.log('Repository:', repo.name);
    console.log('Description:', repo.description);
    console.log('Stars:', repo.stargazers_count);
    console.log('Forks:', repo.forks_count);
    console.log('Open Issues:', repo.open_issues_count);
    console.log('---');

    // Example 2: List repository issues
    console.log('Fetching repository issues...');
    const issues: GitHubIssue[] = await repoApi.listIssues('octocat', 'hello-world', {
      state: 'open',
      sort: 'created',
      direction: 'desc',
      per_page: 5,
    });

    console.log(`Found ${issues.length} open issues:`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title} (#${issue.number})`);
    });
    console.log('---');

    // Example 3: Get user information
    console.log('Fetching user information...');
    const user: GitHubUser = await userApi.getUser('octocat');
    console.log('User:', user.login);
    console.log('Name:', user.name);
    console.log('Bio:', user.bio);
    console.log('Followers:', user.followers);
    console.log('Following:', user.following);
    console.log('---');

    // Example 4: List user repositories
    console.log('Fetching user repositories...');
    const repos: GitHubRepository[] = await userApi.listUserRepositories('octocat', {
      sort: 'updated',
      direction: 'desc',
      per_page: 5,
    });

    console.log(`Found ${repos.length} repositories:`);
    repos.forEach((repo, index) => {
      console.log(`${index + 1}. ${repo.name} - ${repo.description || 'No description'}`);
    });
    console.log('---');

    // Example 5: Direct API call
    console.log('Making a direct API call...');
    const rateLimit: GitHubRateLimit = await githubClient.get<GitHubRateLimit>('rate_limit');
    console.log('Rate Limit Information:');
    console.log('Core:', rateLimit.resources.core);
    console.log('Search:', rateLimit.resources.search);
    console.log('Graphql:', rateLimit.resources.graphql);
    console.log('---');

    // Example 6: Collaborator Management
    // Note: Replace with your own repository and collaborator usernames
    const myOwner = 'your-username';
    const myRepo = 'your-repository';
    const collaboratorUsername = 'collaborator-username';

    // List collaborators
    console.log('Listing repository collaborators...');
    const collaborators = await repoApi.listCollaborators(myOwner, myRepo);
    console.log(`Found ${collaborators.length} collaborators:`);
    collaborators.forEach((collaborator, index) => {
      console.log(`${index + 1}. ${collaborator.login}`);
    });
    console.log('---');

    // Check if a user is a collaborator
    console.log(`Checking if ${collaboratorUsername} is a collaborator...`);
    const isCollaborator = await repoApi.isCollaborator(myOwner, myRepo, collaboratorUsername);
    console.log(`Is collaborator: ${isCollaborator}`);
    console.log('---');

    // Get collaborator permission level
    if (isCollaborator) {
      console.log(`Getting permission level for ${collaboratorUsername}...`);
      const permissionLevel: GitHubCollaboratorPermission = 
        await repoApi.getCollaboratorPermissionLevel(myOwner, myRepo, collaboratorUsername);
      console.log(`Permission: ${permissionLevel.permission}`);
      console.log(`Role: ${permissionLevel.role_name}`);
      console.log('---');

      // Update collaborator permission
      console.log(`Updating permission for ${collaboratorUsername} to 'maintain'...`);
      await repoApi.updateCollaboratorPermission(myOwner, myRepo, collaboratorUsername, 'maintain');
      console.log('Permission updated successfully');
      console.log('---');
    } else {
      // Invite a collaborator
      console.log(`Inviting ${collaboratorUsername} as a collaborator with 'triage' permission...`);
      const invitation: GitHubRepositoryInvitation = 
        await repoApi.addCollaborator(myOwner, myRepo, collaboratorUsername, 'triage');
      console.log(`Invitation created with ID: ${invitation.id}`);
      console.log('---');

      // List pending invitations
      console.log('Listing pending repository invitations...');
      const invitations = await repoApi.listInvitations(myOwner, myRepo);
      console.log(`Found ${invitations.length} pending invitations:`);
      invitations.forEach((invitation, index) => {
        console.log(`${index + 1}. ${invitation.invitee.login} (ID: ${invitation.id})`);
      });
      console.log('---');

      // Delete an invitation
      if (invitations.length > 0) {
        const invitationId = invitations[0].id;
        console.log(`Deleting invitation with ID: ${invitationId}...`);
        await repoApi.deleteInvitation(myOwner, myRepo, invitationId);
        console.log('Invitation deleted successfully');
        console.log('---');
      }
    }

    // Example 7: Managing User Invitations
    console.log('Listing repository invitations for the authenticated user...');
    const myInvitations = await userApi.listRepositoryInvitations();
    console.log(`Found ${myInvitations.length} invitations:`);
    myInvitations.forEach((invitation, index) => {
      console.log(`${index + 1}. ${invitation.repository.full_name} (ID: ${invitation.id})`);
    });
    console.log('---');

    // Accept a specific invitation by ID
    if (myInvitations.length > 0) {
      const invitationId = myInvitations[0].id;
      console.log(`Accepting invitation with ID: ${invitationId}...`);
      await userApi.acceptRepositoryInvitation(invitationId);
      console.log('Invitation accepted successfully');
      console.log('---');
    }

    // Accept a specific invitation by repository name
    console.log(`Accepting invitation for repository: ${myOwner}/${myRepo}...`);
    const accepted = await userApi.acceptRepositoryInvitationByRepo(myOwner, myRepo);
    if (accepted) {
      console.log('Invitation accepted successfully');
    } else {
      console.log('No invitation found for this repository');
    }
    console.log('---');

    // Accept all pending invitations
    console.log('Accepting all pending repository invitations...');
    const acceptedCount = await userApi.acceptAllRepositoryInvitations();
    console.log(`Accepted ${acceptedCount} invitations`);
    console.log('---');

    // Example of declining an invitation (commented out)
    // if (myInvitations.length > 0) {
    //   const invitationId = myInvitations[0].id;
    //   console.log(`Declining invitation with ID: ${invitationId}...`);
    //   await userApi.declineRepositoryInvitation(invitationId);
    //   console.log('Invitation declined successfully');
    //   console.log('---');
    // }

    // Example 8: Managing User Invitations with a specific user's token
    // This is useful when you need to accept invitations on behalf of another user
    const userAccessToken = 'user-provided-access-token'; // Replace with actual user token
    
    console.log('Listing repository invitations for a specific user...');
    const userInvitations = await userApi.listRepositoryInvitations(userAccessToken);
    console.log(`Found ${userInvitations.length} invitations for the user`);
    userInvitations.forEach((invitation, index) => {
      console.log(`${index + 1}. ${invitation.repository.full_name} (ID: ${invitation.id})`);
    });
    console.log('---');

    // Accept a specific invitation by ID with user token
    if (userInvitations.length > 0) {
      const invitationId = userInvitations[0].id;
      console.log(`Accepting invitation with ID: ${invitationId} for the user...`);
      await userApi.acceptRepositoryInvitation(invitationId, userAccessToken);
      console.log('Invitation accepted successfully for the user');
      console.log('---');
    }

    // Accept a specific invitation by repository name with user token
    console.log(`Accepting invitation for repository: ${myOwner}/${myRepo} for the user...`);
    const userAccepted = await userApi.acceptRepositoryInvitationByRepo(myOwner, myRepo, userAccessToken);
    if (userAccepted) {
      console.log('Invitation accepted successfully for the user');
    } else {
      console.log('No invitation found for this repository for the user');
    }
    console.log('---');

    // Accept all pending invitations with user token
    console.log('Accepting all pending repository invitations for the user...');
    const userAcceptedCount = await userApi.acceptAllRepositoryInvitations(userAccessToken);
    console.log(`Accepted ${userAcceptedCount} invitations for the user`);
    console.log('---');

    // Example 9: Creating a new repository
    console.log('Creating a new repository...');
    const newRepo = await repoApi.createRepo({
      name: 'my-new-repo',
      description: 'A repository created via the GitHub API',
      private: true,
      auto_init: true,
      gitignore_template: 'Node',
      license_template: 'mit'
    });
    console.log(`Repository created: ${newRepo.full_name}`);
    console.log(`URL: ${newRepo.html_url}`);
    console.log('---');

    // Example 10: Creating a repository from a template
    console.log('Creating a repository from a template...');
    const templateOwner = 'template-owner';
    const templateRepo = 'template-repo';
    const newRepoFromTemplate = await repoApi.createRepoFromTemplate(
      templateOwner,
      templateRepo,
      {
        owner: myOwner,
        name: 'repo-from-template',
        description: 'A repository created from a template via the GitHub API',
        private: true
      }
    );
    console.log(`Repository created from template: ${newRepoFromTemplate.full_name}`);
    console.log(`URL: ${newRepoFromTemplate.html_url}`);
    console.log('---');

    // Example 11: Deleting a repository
    console.log('Deleting a repository...');
    const repoToDelete = 'repo-to-delete';
    await repoApi.deleteRepo(myOwner, repoToDelete);
    console.log(`Repository ${myOwner}/${repoToDelete} deleted successfully`);
    console.log('---');

  } catch (error) {
    console.error('Error in GitHub API example:', error);
  }
}

// Uncomment to run the example
// githubApiExample().catch(console.error);

export { githubApiExample }; 