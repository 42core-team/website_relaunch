import 'reflect-metadata';
import {DataSource} from "typeorm";
import {MatchEntity} from "@/entities/match.entity";
import {UserEntity} from "@/entities/users.entity";
import {TeamEntity} from "@/entities/team.entity";
import {EventEntity} from "@/entities/event.entity";
import {NotificationEntity} from "@/entities/notifications.entity";


export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "postgres",
    synchronize: true,
    logging: false,
    entities: [MatchEntity, UserEntity, TeamEntity, EventEntity, NotificationEntity],
});

export async function initializeDb() {
    try {
        await AppDataSource.initialize();
        console.log("Connected to database");
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error;
    }
}

let initialized = false;

export async function ensureDbConnected() {
    if (!initialized) {
        await initializeDb();
        initialized = true;
    }
    return AppDataSource;
}

ensureDbConnected()