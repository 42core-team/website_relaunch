import {DataSource, DataSourceOptions} from "typeorm";
import {ConfigService} from "@nestjs/config";

export class DatabaseConfig {
    constructor(private configService: ConfigService) {
    }

    getConfig(migrations: boolean = false) {
        return {
            type: "postgres",
            host: this.configService.getOrThrow("DB_HOST"),
            port: this.configService.getOrThrow("DB_PORT"),
            username: this.configService.getOrThrow("DB_USER"),
            password: this.configService.getOrThrow("DB_PASSWORD"),
            database: this.configService.getOrThrow("DB_NAME"),
            schema: this.configService.getOrThrow("DB_SCHEMA"),
            entities: ["dist/**/*.entity{.ts,.js}"],
            migrations: migrations ? ["db/migrations/**"]: [],
            autoLoadEntities: true,
            synchronize: true
        };
    }

    /*
    This function will be used for the database connection and migrations.
     */
    createDataSource(): DataSource {
        const config = this.getConfig(true);
        return new DataSource(config as DataSourceOptions);
    }
}