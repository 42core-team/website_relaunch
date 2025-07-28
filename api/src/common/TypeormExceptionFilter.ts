import {EntityNotFoundError} from "typeorm";
import {ExceptionFilter, Catch, ArgumentsHost, HttpStatus} from '@nestjs/common';
import {Response} from 'express';

@Catch(EntityNotFoundError)
export class TypeormExceptionFilter implements ExceptionFilter {
    catch(exception: EntityNotFoundError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(HttpStatus.NOT_FOUND).json({
            statusCode: HttpStatus.NOT_FOUND,
            timestamp: new Date().toISOString(),
            message: 'Entity not found',
            error: exception.message
        })
    }

}