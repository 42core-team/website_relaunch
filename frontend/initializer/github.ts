import { GitHubApiClient } from "@/utils/github-api/client";
import { UserApi, RepositoryApi } from "@/utils/github-api/endpoints";

export const githubApi = new GitHubApiClient({
  token: process.env.GITHUB_TOKEN,
});

export const rushGithubApi = new GitHubApiClient({
  token: process.env.GITHUB_RUSH_TOKEN,
});

export const userApi = new UserApi(githubApi);
export const repositoryApi = new RepositoryApi(githubApi);

export const rushUserApi = new UserApi(rushGithubApi);
export const rushRepositoryApi = new RepositoryApi(rushGithubApi);
