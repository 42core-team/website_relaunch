import { ConfigService } from "@nestjs/config";
import {DatabaseConfig} from "./src/DatabaseConfig";

import { config } from "dotenv";

config();

const configService = new ConfigService();
const databaseConfig = new DatabaseConfig(configService);

export default databaseConfig.createDataSource();
