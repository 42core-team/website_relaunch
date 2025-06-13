import {CanActivate, createParamDecorator, ExecutionContext, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";
import {ConfigService} from "@nestjs/config";


export const UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.headers['userid'] || request.userId;
    },
);

export class FrontendGuard implements CanActivate {
    constructor(private readonly config: ConfigService) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;
        if (!authorization && authorization !== this.config.get("FRONTEND_SECRET"))
            throw new UnauthorizedException()
        return true;
    }
}