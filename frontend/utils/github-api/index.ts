export * from './client';
export * from './types';
export * from './endpoints';
export * from './response-types';

// Usage example:
/*
import { 
  GitHubApiClient, 
  RepositoryApi, 
  UserApi, 
  GitHubRepository, 
  GitHubUser, 
  GitHubIssue 
} from './utils/github-api';

// Create a GitHub API client
const githubClient = new GitHubApiClient({
  token: process.env.GITHUB_TOKEN, // Personal access token
  userAgent: 'My-App/1.0.0', // Custom user agent
});

// Create API instances
const repoApi = new RepositoryApi(githubClient);
const userApi = new UserApi(githubClient);

// Example: Get repository information
async function getRepoInfo() {
  try {
    const repo: GitHubRepository = await repoApi.getRepository('octocat', 'hello-world');
    console.log('Repository:', repo.name);
    console.log('Stars:', repo.stargazers_count);
    
    // List issues
    const issues: GitHubIssue[] = await repoApi.listIssues('octocat', 'hello-world', {
      state: 'open',
      sort: 'created',
      direction: 'desc',
      per_page: 10,
    });
    
    console.log(`Found ${issues.length} open issues`);
  } catch (error) {
    console.error('Error fetching repository:', error);
  }
}

// Example: Get user information
async function getUserInfo() {
  try {
    const user: GitHubUser = await userApi.getUser('octocat');
    console.log('User:', user.login);
    console.log('Name:', user.name);
    
    // List repositories
    const repos: GitHubRepository[] = await userApi.listUserRepositories('octocat', {
      sort: 'updated',
      direction: 'desc',
    });
    
    console.log(`Found ${repos.length} repositories`);
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}
*/ 