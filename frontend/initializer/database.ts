import 'reflect-metadata';
import {DataSource} from "typeorm";
import {MatchEntity} from "@/entities/match.entity";
import {UserEntity} from "@/entities/users.entity";
import {TeamEntity} from "@/entities/team.entity";
import {EventEntity} from "@/entities/event.entity";
import {UserEventPermissionEntity} from "@/entities/user-event-permission.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "postgres",
    schema: process.env.DB_SCHEMA || "public",
    synchronize: true,
    logging: false,
    entities: [MatchEntity, UserEntity, TeamEntity, EventEntity, UserEventPermissionEntity],
});

// Use a promise to track initialization status
let initializationPromise: Promise<DataSource> | null = null;

export async function ensureDbConnected(): Promise<DataSource> {
    if (AppDataSource.isInitialized) {
        return AppDataSource;
    }

    if (!initializationPromise) {
        initializationPromise = AppDataSource.initialize()
            .then(async dataSource => {
                console.log("Connected to database");
                await AppDataSource.runMigrations();
                return dataSource;
            })
            .catch(error => {
                // Reset the promise so initialization can be retried
                initializationPromise = null;
                console.error("Error connecting to database:", error);
                throw error;
            });
    }

    return initializationPromise;
}
