import {Controller, Logger} from '@nestjs/common';
import {AppService} from './app.service';
import {EventPattern, Ctx, RmqContext} from "@nestjs/microservices";

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);
    private readonly maxAttempts = 10;
    constructor(private readonly appService: AppService) {
    }

    private requeueOrDrop(context: RmqContext): void {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const properties = originalMsg.properties || {};
        const headers: Record<string, any> = {
            ...(properties.headers || {}),
        };
        const attempts = Number(headers["x-attempts"] ?? headers["attempts"] ?? 0);
        const nextAttempts = attempts + 1;
        const routingKey = originalMsg.fields.routingKey;

        if (nextAttempts >= this.maxAttempts) {
            this.logger.error(`Max attempts reached (${nextAttempts}). Publishing to DLQ. routingKey=${routingKey}`);
            const dlqName = `${routingKey}_dead_letter`;
            const dlqHeaders = { ...headers, "x-original-routing-key": routingKey, "x-attempts": nextAttempts };
            const dlqOptions: any = { ...properties, headers: dlqHeaders };
            try {
                channel.sendToQueue(dlqName, originalMsg.content, dlqOptions);
            } finally {
                channel.ack(originalMsg);
            }
            return;
        }

        const newHeaders = {
            ...headers,
            "x-attempts": nextAttempts,
        };
        const options: any = {
            ...properties,
            headers: newHeaders,
        };
        channel.sendToQueue(routingKey, originalMsg.content, options);
        channel.ack(originalMsg);
    }

    @EventPattern("remove_write_permissions")
    async handleRemoveWritePermissions(data: {
        username: string,
        repoOwner: string,
        repoName: string,
        encryptedSecret: string,
    }, @Ctx() context: RmqContext) {
        const safeData = {
            username: data.username,
            repoOwner: data.repoOwner,
            repoName: data.repoName,
        };
        this.logger.log(`remove_write_permissions event received ${JSON.stringify(safeData)}`);
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            const result = await this.appService.removeWritePermissionsForUser(
                data.username,
                data.repoOwner,
                data.repoName,
                data.encryptedSecret,
            );
            channel.ack(originalMsg);
            return result;
        } catch (error) {
            this.logger.error(`Error in remove_write_permissions: ${error}`);
            this.requeueOrDrop(context);
        }
    }

    @EventPattern("add_user_to_repository")
    async handleAddUserToRepository(data: {
        repositoryName: string,
        username: string,
        githubOrg: string,
        encryptedSecret: string,
        githubAccessToken: string,
    }, @Ctx() context: RmqContext) {
        const safeData = {
            repositoryName: data.repositoryName,
            username: data.username,
            githubOrg: data.githubOrg,
        };
        this.logger.log(`add_user_to_repository event received ${JSON.stringify(safeData)}`);
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            const result = await this.appService.addUserToRepository(
                data.repositoryName,
                data.username,
                data.githubOrg,
                data.encryptedSecret,
                data.githubAccessToken,
            );
            channel.ack(originalMsg);
            return result;
        } catch (error) {
            this.logger.error(`Error in add_user_to_repository: ${error}`);
            this.requeueOrDrop(context);
        }
    }

    @EventPattern("remove_user_from_repository")
    async handleRemoveUserFromRepository(data: {
        repositoryName: string,
        username: string,
        githubOrg: string,
        encryptedSecret: string,
    }, @Ctx() context: RmqContext) {
        const safeData = {
            repositoryName: data.repositoryName,
            username: data.username,
            githubOrg: data.githubOrg,
        };
        this.logger.log(`remove_user_from_repository event received ${JSON.stringify(safeData)}`);
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            const result = await this.appService.removeUserFromRepository(
                data.repositoryName,
                data.username,
                data.githubOrg,
                data.encryptedSecret,
            );
            channel.ack(originalMsg);
            return result;
        } catch (error) {
            this.logger.error(`Error in remove_user_from_repository: ${error}`);
            this.requeueOrDrop(context);
        }
    }

    @EventPattern("delete_repository")
    async handleDeleteRepository(data: {
        repositoryName: string,
        githubOrg: string,
        encryptedSecret: string,
    }, @Ctx() context: RmqContext) {
        const safeData = {
            repositoryName: data.repositoryName,
            githubOrg: data.githubOrg,
        };
        this.logger.log(`delete_repository event received ${JSON.stringify(safeData)}`);
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            const result = await this.appService.deleteRepository(
                data.repositoryName,
                data.githubOrg,
                data.encryptedSecret,
            );
            channel.ack(originalMsg);
            return result;
        } catch (error) {
            this.logger.error(`Error in delete_repository: ${error}`);
            this.requeueOrDrop(context);
        }
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
    }, @Ctx() context: RmqContext) {
        const safeData = {
            name: data.name,
            username: data.username,
            githubOrg: data.githubOrg,
            repoTemplateOwner: data.repoTemplateOwner,
            repoTemplateName: data.repoTemplateName,
            teamId: data.teamId,
        };
        this.logger.log(`create_team_repository event received ${JSON.stringify(safeData)}`);
       const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            const result = await this.appService.createTeamRepository(
                data.name,
                data.username,
                data.userGithubAccessToken,
                data.githubOrg,
                data.encryptedSecret,
                data.repoTemplateOwner,
                data.repoTemplateName,
                data.teamId
            );
            channel.ack(originalMsg);
            return result;
        } catch (error) {
            this.logger.error(`Error in create_team_repository: ${error}`);
            this.requeueOrDrop(context);
        }
    }
}
