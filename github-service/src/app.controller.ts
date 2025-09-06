import {Controller} from '@nestjs/common';
import {AppService} from './app.service';
import {EventPattern} from "@nestjs/microservices";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @EventPattern("remove_write_permissions")
    async handleRemoveWritePermissions(data: {
        username: string,
        repoOwner: string,
        repoName: string,
        encryptedSecret: string,
    }) {
        return await this.appService.removeWritePermissionsForUser(
            data.username,
            data.repoOwner,
            data.repoName,
            data.encryptedSecret,
        );
    }

    @EventPattern("add_user_to_repository")
    async handleAddUserToRepository(data: {
        repositoryName: string,
        username: string,
        githubOrg: string,
        encryptedSecret: string,
        githubAccessToken: string,
    }) {
        console.log("add_user_to_repository event received with data:", data);
        return await this.appService.addUserToRepository(
            data.repositoryName,
            data.username,
            data.githubOrg,
            data.encryptedSecret,
            data.githubAccessToken,
        );
    }

    @EventPattern("remove_user_from_repository")
    async handleRemoveUserFromRepository(data: {
        repositoryName: string,
        username: string,
        githubOrg: string,
        encryptedSecret: string,
    }) {
        console.log("remove_user_from_repository event received with data:", data);
        return await this.appService.removeUserFromRepository(
            data.repositoryName,
            data.username,
            data.githubOrg,
            data.encryptedSecret,
        );
    }

    @EventPattern("delete_repository")
    async handleDeleteRepository(data: {
        repositoryName: string,
        githubOrg: string,
        encryptedSecret: string,
    }) {
        console.log("delete_repository event received with data:", data);
        return await this.appService.deleteRepository(
            data.repositoryName,
            data.githubOrg,
            data.encryptedSecret,
        );
    }

    @EventPattern("create_team_repository")
    async handleCreateTeamRepository(data: {
        name: string,
        username: string,
        userGithubAccessToken: string,
        githubOrg: string,
        encryptedSecret: string,
        repoTemplateOwner: string,
        repoTemplateName: string,
        teamId: string
    }) {
        console.log("create_team_repository event received with data:", data);
        return await this.appService.createTeamRepository(
            data.name,
            data.username,
            data.userGithubAccessToken,
            data.githubOrg,
            data.encryptedSecret,
            data.repoTemplateOwner,
            data.repoTemplateName,
            data.teamId
        );
    }
}
