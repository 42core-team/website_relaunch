import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import * as CryptoJS from "crypto-js";
import {GitHubApiClient, RepositoryApi} from "../common/githubApi";

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
}
