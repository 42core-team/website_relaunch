import {DataSource, DataSourceOptions} from "typeorm";
import {ConfigService} from "@nestjs/config";

export class DatabaseConfig {
    constructor(private configService: ConfigService) {
    }

    getConfig(migrations: boolean = false) {
        const config: any = {
            type: "postgres",
            host: this.configService.getOrThrow("DB_HOST"),
            port: this.configService.getOrThrow("DB_PORT"),
            username: this.configService.getOrThrow("DB_USER"),
            password: this.configService.getOrThrow("DB_PASSWORD"),
            database: this.configService.getOrThrow("DB_NAME"),
            schema: this.configService.getOrThrow("DB_SCHEMA"),
            entities: ["dist/**/*.entity{.ts,.js}"],
            migrations: migrations ? ["db/migrations/**"] : [],
            autoLoadEntities: true,
            url: this.configService.get("DB_URL"),
            synchronize: true, // TODO: move to migrations,
            timezone: 'Z',
            dateStrings: false,
        };

        // Add SSL configuration if required
        const requireSSL = this.configService.get("DB_SSL_REQUIRED", "false");
        if (requireSSL === "true") {
            config.ssl = {
                rejectUnauthorized: true, // For development - set to true in production
                require: true,
            };
        }

        return config;
    }

    /*
      This function will be used for the database connection and migrations.
       */
    createDataSource(): DataSource {
        const config = this.getConfig(true);
        return new DataSource(config as DataSourceOptions);
    }
}
