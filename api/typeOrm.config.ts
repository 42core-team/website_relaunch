import { ConfigService } from "@nestjs/config";
import {DatabaseConfig} from "./src/DatabaseConfig";

const configService = new ConfigService();
const databaseConfig = new DatabaseConfig(configService);

export default databaseConfig.createDataSource();
