import {Injectable, Logger} from '@nestjs/common';
import {GitHubApiClient, RepositoryApi, UserApi} from "./githubApi";
import * as CryptoJS from "crypto-js";
import {ConfigService} from "@nestjs/config";
import {ClientProxy, ClientProxyFactory} from "@nestjs/microservices";
import {getRabbitmqConfig} from "./main";
import * as fs from "fs/promises";
import simpleGit from "simple-git";

@Injectable()
export class AppService {
    private githubServiceResultsClient: ClientProxy;
    private readonly logger = new Logger(AppService.name);

    private readonly TMP_FOLDER = "./tmp"

    constructor(private configService: ConfigService) {
        this.githubServiceResultsClient = ClientProxyFactory.create(getRabbitmqConfig(configService, "github-service-results"))
        fs.mkdir(this.TMP_FOLDER).then(() => {
            this.logger.log(`Created temp folder at ${this.TMP_FOLDER}`);
        }).catch((error) => {
            if (error.code !== 'EXIST') {
                this.logger.error(`Failed to create temp folder at ${this.TMP_FOLDER} because it already exists`);
            }
        })
    }

    decryptSecret(encryptedSecret: string): string {
        try {
            return CryptoJS.AES.decrypt(
                encryptedSecret,
                this.configService.getOrThrow<string>("API_SECRET_ENCRYPTION_KEY"),
            ).toString(CryptoJS.enc.Utf8);
        } catch (error) {
            this.logger.error("Failed to decrypt secret", error as Error);
            throw error;
        }
    }

    async removeWritePermissionsForUser(
        username: string,
        repoOwner: string,
        repoName: string,
        encryptedSecret: string,
    ) {
        this.logger.log(`Removing write permissions for user ${JSON.stringify({username, repoOwner, repoName})}`);
        try {
            const secret = this.decryptSecret(encryptedSecret);
            const githubApi = new GitHubApiClient({
                token: secret,
            });
            const repositoryApi = new RepositoryApi(githubApi);
            const result = await repositoryApi.updateCollaboratorPermission(
                repoOwner,
                repoName,
                username,
                "pull",
            );
            this.logger.log(`Removed write permissions for user ${JSON.stringify({username, repoOwner, repoName})}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to remove write permissions for user ${JSON.stringify({
                username,
                repoOwner,
                repoName
            })}`, error as Error);
            throw error;
        }
    }

    async addUserToRepository(
        repositoryName: string,
        username: string,
        githubOrg: string,
        encryptedSecret: string,
        encryptedGithubAccessToken: string,
    ) {
        this.logger.log(`Adding user to repository ${JSON.stringify({repositoryName, username, githubOrg})}`);
        try {
            const secret = this.decryptSecret(encryptedSecret);
            const githubAccessToken = this.decryptSecret(encryptedGithubAccessToken);
            const githubApi = new GitHubApiClient({
                token: secret,
            });
            const repositoryApi = new RepositoryApi(githubApi);
            const userApi = new UserApi(githubApi);
            await repositoryApi.addCollaborator(
                githubOrg,
                repositoryName,
                username,
                "push",
            );
            await userApi.acceptRepositoryInvitationByRepo(
                githubOrg,
                repositoryName,
                githubAccessToken,
            );
            this.logger.log(`Added user to repository ${JSON.stringify({repositoryName, username, githubOrg})}`);
        } catch (error) {
            this.logger.error(`Failed to add user to repository ${JSON.stringify({
                repositoryName,
                username,
                githubOrg
            })}`, error as Error);
            throw error;
        }
    }

    async removeUserFromRepository(
        repositoryName: string,
        username: string,
        githubOrg: string,
        encryptedSecret: string,
    ) {
        this.logger.log(`Removing user from repository ${JSON.stringify({repositoryName, username, githubOrg})}`);
        try {
            const secret = this.decryptSecret(encryptedSecret);
            const githubApi = new GitHubApiClient({
                token: secret,
            });
            const repositoryApi = new RepositoryApi(githubApi);
            await repositoryApi.removeCollaborator(githubOrg, repositoryName, username);
            this.logger.log(`Removed user from repository ${JSON.stringify({repositoryName, username, githubOrg})}`);
        } catch (error) {
            this.logger.error(`Failed to remove user from repository ${JSON.stringify({
                repositoryName,
                username,
                githubOrg
            })}`, error as Error);
            throw error;
        }
    }

    async deleteRepository(
        repositoryName: string,
        githubOrg: string,
        encryptedSecret: string,
    ) {
        this.logger.log(`Deleting repository ${JSON.stringify({repositoryName, githubOrg})}`);
        try {
            const secret = this.decryptSecret(encryptedSecret);
            const githubApi = new GitHubApiClient({
                token: secret,
            });
            const repositoryApi = new RepositoryApi(githubApi);
            const result = await repositoryApi.deleteRepo(githubOrg, repositoryName);
            this.logger.log(`Deleted repository ${JSON.stringify({repositoryName, githubOrg})}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to delete repository ${JSON.stringify({
                repositoryName,
                githubOrg
            })}`, error as Error);
            throw error;
        }
    }

    async cloneMonoRepoAndPushToTeamRepo(
        monoRepoUrl: string,
        teamRepoUrl: string,
        decryptedGithubAccessToken: string,
        tempFolderPath: string
    ) {
        this.logger.log(`Cloning mono repo ${monoRepoUrl} to temp folder ${tempFolderPath}`);
        const git = simpleGit(tempFolderPath);
        await git.clone(monoRepoUrl, tempFolderPath, ['--depth', '1']);
        this.logger.log(`Cloned mono repo ${monoRepoUrl} to temp folder ${tempFolderPath}`);
        await git.submoduleUpdate(['--init', '--', 'my-core-bot']);
        this.logger.log(`Updated submodules in temp folder ${tempFolderPath}`);

        try {
            await git.removeRemote("team-repo");
        } catch (error) {
            this.logger.warn(`No origin remote to remove in temp folder ${tempFolderPath}`);
        }
        await git.addRemote('team-repo', teamRepoUrl.replace('https://', `https://${decryptedGithubAccessToken}@`));
        this.logger.log(`Added remote team-repo ${teamRepoUrl} in temp folder ${tempFolderPath}`);
        await git.push('team-repo', 'main');
        this.logger.log(`Pushed to team-repo ${teamRepoUrl} from temp folder ${tempFolderPath}`);
        // await fs.rm(tempFolderPath, {recursive: true, force: true});
        this.logger.log(`Removed temp folder ${tempFolderPath}`);

    }

    async createTeamRepository(
        name: string,
        username: string,
        encryptedUserGithubAccessToken: string,
        githubOrg: string,
        encryptedSecret: string,
        repoTemplateOwner: string,
        repoTemplateName: string,
        teamId: string,
        monoRepoUrl: string
    ) {
        this.logger.log(`Creating team repository ${JSON.stringify({
            name,
            username,
            githubOrg,
            repoTemplateOwner,
            repoTemplateName,
            teamId
        })}`);
        try {
            const githubAccessToken = this.decryptSecret(encryptedUserGithubAccessToken);
            const secret = this.decryptSecret(encryptedSecret);
            const githubApi = new GitHubApiClient({
                token: secret,
            });
            const repositoryApi = new RepositoryApi(githubApi);
            const userApi = new UserApi(githubApi);
            this.logger.log(`Creating repo ${name} in org ${githubOrg} with secret ${secret}`);
            const repo = await repositoryApi.createRepo({
                name,
                private: true,

            }, githubOrg)

            const tempFolderPath = `${this.TMP_FOLDER}/${repo.name}-${Date.now()}`;
            await fs.mkdir(tempFolderPath);
            console.log(repo)
            this.logger.log(`Created temp folder at ${tempFolderPath} for repo ${repo.name} and url ${repo.clone_url}`);
            await this.cloneMonoRepoAndPushToTeamRepo(monoRepoUrl, repo.clone_url, secret, tempFolderPath);


            this.githubServiceResultsClient.emit("repository_created", {
                repositoryName: repo.name,
                teamId: teamId
            });

            await repositoryApi.addCollaborator(githubOrg, repo.name, username, "push");
            await userApi.acceptRepositoryInvitationByRepo(
                githubOrg,
                repo.name,
                githubAccessToken,
            );

            this.logger.log(`Created team repository ${JSON.stringify({
                name,
                username,
                githubOrg,
                teamId,
                repoName: repo.name
            })}`);
            return repo;
        } catch (error) {
            this.logger.error(`Failed to create team repository ${JSON.stringify({
                name,
                username,
                githubOrg,
                repoTemplateOwner,
                repoTemplateName,
                teamId
            })}`, error as Error);
            throw error;
        }
    }
}
