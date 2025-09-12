import {MigrationInterface, QueryRunner} from "typeorm";
import * as CryptoJS from "crypto-js";
import {ConfigService} from "@nestjs/config";

export class EncryptUserToken1757351174916 implements MigrationInterface {
    configService = new ConfigService()

    public async up(queryRunner: QueryRunner): Promise<void> {
        const users: {
            id: string,
            githubAccessToken: string
        }[] = await queryRunner.query("select * from users");

        await Promise.all(users.map(async (user) => {
            const encryptedToken = CryptoJS.AES.encrypt(user.githubAccessToken, this.configService.getOrThrow("API_SECRET_ENCRYPTION_KEY")).toString()
            await queryRunner.query(`update users set "githubAccessToken" = $1 where id = $2`, [encryptedToken, user.id])
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const users: {
            id: string,
            githubAccessToken: string
        }[] = await queryRunner.query("select * from users");

        await Promise.all(users.map(async (user) => {
            const decryptedToken = CryptoJS.AES.decrypt(
                user.githubAccessToken,
                this.configService.getOrThrow<string>("API_SECRET_ENCRYPTION_KEY"),
            ).toString(CryptoJS.enc.Utf8);
            await queryRunner.query(`update users set "githubAccessToken" = $1 where id = $2`, [decryptedToken, user.id])
        }))
    }

}
