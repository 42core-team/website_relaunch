import {Injectable} from '@nestjs/common';
import {GitHubApiClient, RepositoryApi, UserApi} from "./githubApi";
import * as CryptoJS from "crypto-js";
import {ConfigService} from "@nestjs/config";
import {ClientProxy, ClientProxyFactory} from "@nestjs/microservices";
import {getRabbitmqConfig} from "./main";

@Injectable()
export class AppService {
    private githubServiceResultsClient: ClientProxy;

    constructor(private configService: ConfigService) {
        this.githubServiceResultsClient = ClientProxyFactory.create(getRabbitmqConfig(configService, "github-service-results"))
    }

    decryptSecret(encryptedSecret: string): string {
        return CryptoJS.AES.decrypt(
            encryptedSecret,
            this.configService.getOrThrow<string>("API_SECRET_ENCRYPTION_KEY"),
        ).toString(CryptoJS.enc.Utf8);
    }

    async removeWritePermissionsForUser(
        username: string,
        repoOwner: string,
        repoName: string,
        encryptedSecret: string,
    ) {
        const secret = this.decryptSecret(encryptedSecret);
        const githubApi = new GitHubApiClient({
            token: secret,
        });
        const repositoryApi = new RepositoryApi(githubApi);
        return await repositoryApi.updateCollaboratorPermission(
            repoOwner,
            repoName,
            username,
            "pull",
        );
    }

    async addUserToRepository(
        repositoryName: string,
        username: string,
        githubOrg: string,
        encryptedSecret: string,
        githubAccessToken: string,
    ) {
        const secret = this.decryptSecret(encryptedSecret);
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
    }

    async removeUserFromRepository(
        repositoryName: string,
        username: string,
        githubOrg: string,
        encryptedSecret: string,
    ) {
        const secret = this.decryptSecret(encryptedSecret);
        const githubApi = new GitHubApiClient({
            token: secret,
        });
        const repositoryApi = new RepositoryApi(githubApi);
        const userApi = new UserApi(githubApi);
        await repositoryApi.removeCollaborator(githubOrg, repositoryName, username);
    }

    async deleteRepository(
        repositoryName: string,
        githubOrg: string,
        encryptedSecret: string,
    ) {
        const secret = this.decryptSecret(encryptedSecret);
        const githubApi = new GitHubApiClient({
            token: secret,
        });
        const repositoryApi = new RepositoryApi(githubApi);
        return await repositoryApi.deleteRepo(githubOrg, repositoryName);
    }

    async createTeamRepository(
        name: string,
        username: string,
        userGithubAccessToken: string,
        githubOrg: string,
        encryptedSecret: string,
        repoTemplateOwner: string,
        repoTemplateName: string,
        teamId: string
    ) {
        const secret = this.decryptSecret(encryptedSecret);
        const githubApi = new GitHubApiClient({
            token: secret,
        });
        const repositoryApi = new RepositoryApi(githubApi);
        const userApi = new UserApi(githubApi);
        const repo = await repositoryApi.createRepoFromTemplate(
            repoTemplateOwner,
            repoTemplateName,
            {
                owner: githubOrg,
                name,
                private: true,
            },
        );

        this.githubServiceResultsClient.emit("repository_created", {
            repositoryName: repo.name,
            teamId: teamId
        });

        await repositoryApi.addCollaborator(githubOrg, repo.name, username, "push");
        await userApi.acceptRepositoryInvitationByRepo(
            githubOrg,
            repo.name,
            userGithubAccessToken,
        );

        return repo;
    }
}
