import {NestFactory, Reflector} from '@nestjs/core';
import {AppModule} from './app.module';
import {ClassSerializerInterceptor, ValidationPipe} from "@nestjs/common";
import {TypeormExceptionFilter} from "./common/TypeormExceptionFilter";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalFilters(new TypeormExceptionFilter());
    app.enableCors();

    const config = new DocumentBuilder()
        .setTitle('CORE game API')
        .setDescription('This is the API for the CORE game backend.')
        .setVersion('1.0')
        .addTag('core')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
