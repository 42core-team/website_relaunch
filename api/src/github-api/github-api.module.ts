import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { GithubApiService } from "./github-api.service";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'GITHUB_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'github_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [GithubApiService],
  exports: [GithubApiService],
})
export class GithubApiModule {}
