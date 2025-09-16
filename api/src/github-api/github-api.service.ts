import {Injectable} from "@nestjs/common";
import {ClientProxy, ClientProxyFactory} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";
import {getRabbitmqConfig} from "../main";

@Injectable()
export class GithubApiService {
    private githubClient: ClientProxy

    constructor(
        private configService: ConfigService,
    ) {
        this.githubClient = ClientProxyFactory.create(getRabbitmqConfig(configService, "github_service"))
    }

    decryptSecret(encryptedSecret: string): string {
        return CryptoJS.AES.decrypt(
            encryptedSecret,
            this.configService.getOrThrow<string>("API_SECRET_ENCRYPTION_KEY"),
        ).toString(CryptoJS.enc.Utf8);
    }

    async removeWritePermissions(
        username: string,
        repoOwner: string,
        repoName: string,
        encryptedSecret: string,
    ) {
        this.githubClient.emit('remove_write_permissions', {
            username,
            repoOwner,
            repoName,
            encryptedSecret,
        })
    }

    async addUserToRepository(
        repositoryName: string,
        username: string,
        githubOrg: string,
        encryptedSecret: string,
        githubAccessToken: string,
    ) {
        this.githubClient.emit('add_user_to_repository', {
            repositoryName,
            username,
            githubOrg,
            encryptedSecret,
            githubAccessToken,
        })
    }

    async removeUserFromRepository(
        repositoryName: string,
        username: string,
        githubOrg: string,
        encryptedSecret: string,
    ) {
        this.githubClient.emit('remove_user_from_repository', {
            repositoryName,
            username,
            githubOrg,
            encryptedSecret,
        })
    }

    async deleteRepository(
        repositoryName: string,
        githubOrg: string,
        encryptedSecret: string,
    ) {
        this.githubClient.emit('delete_repository', {
            repositoryName,
            githubOrg,
            encryptedSecret,
        })
    }

    async createTeamRepository(
        name: string,
        username: string,
        userGithubAccessToken: string,
        githubOrg: string,
        encryptedSecret: string,
        repoTemplateOwner: string,
        repoTemplateName: string,
        teamId: string,
        monoRepoUrl: string,
        monoRepoBranch: string,
        monoRepoTag: string,
        eventId: string
    ) {
        this.githubClient.emit('create_team_repository', {
            name,
            username,
            userGithubAccessToken,
            githubOrg,
            encryptedSecret,
            repoTemplateOwner,
            repoTemplateName,
            teamId,
            monoRepoUrl,
            monoRepoBranch,
            monoRepoTag,
            eventId
        })
    }
}
