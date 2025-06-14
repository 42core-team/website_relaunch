import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import * as CryptoJS from "crypto-js";
import {GitHubApiClient, RepositoryApi, UserApi} from "../common/githubApi";

@Injectable()
export class GithubApiService {
    constructor(
        private readonly configService: ConfigService
    ) {
    }

    decryptSecret(encryptedSecret: string): string {
        return CryptoJS.AES.decrypt(encryptedSecret, this.configService.getOrThrow<string>('API_SECRET_ENCRYPTION_KEY')).toString();
    }


    async removeWritePermissionsForUser(
        username: string,
        repoOwner: string,
        repoName: string,
        encryptedSecret: string
    ) {
        const secret = this.decryptSecret(encryptedSecret);
        const githubApi = new GitHubApiClient({
            token: secret
        })
        const repositoryApi = new RepositoryApi(githubApi);
        return await repositoryApi.updateCollaboratorPermission(
            repoOwner,
            repoName,
            username,
            'pull'
        )
    }

    async createTeamRepository(
        name: string,
        username: string,
        userGithubAccessToken: string,
        githubOrg: string,
        encryptedSecret: string,
        repoTemplateOwner: string,
        repoTemplateName: string
    ) {
        const secret = this.decryptSecret(encryptedSecret);
        const githubApi = new GitHubApiClient({
            token: secret
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
            }
        )

        await repositoryApi.addCollaborator(githubOrg, repo.name, username, "push");
        await userApi.acceptRepositoryInvitationByRepo(
            githubOrg,
            repo.name,
            userGithubAccessToken
        )
    }
}
