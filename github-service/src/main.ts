import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";
import { Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

export const getRabbitmqConfig: any = (configService: ConfigService, queue: string) => {
    return {
        transport: Transport.RMQ,
        options: {
            urls: [configService.getOrThrow<string>("RABBITMQ_URL")],
            queue: queue,
            noAck: false,
            prefetchCount: 1,
            queueOptions: {
                arguments: {
                    "x-queue-type": "quorum",
                }
            },
        }
    }
}

async function bootstrap() {
    const configService = new ConfigService();
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,
        getRabbitmqConfig(configService, "github_service"));
    app.useLogger(new Logger());

    // Assert dead-letter queues for involved queues
    const rabbitUrl = configService.getOrThrow<string>("RABBITMQ_URL");
    const connection = await amqp.connect(rabbitUrl);
    try {
        const channel = await connection.createChannel();
        // Assert DLQ for main service queue
        await channel.assertQueue("github_service_dead_letter", {
            durable: true,
            arguments: { "x-queue-type": "quorum" }
        });
        await channel.close();
    } finally {
        await connection.close();
    }
    await app.listen();
}

bootstrap();
