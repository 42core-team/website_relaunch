import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";

@Injectable()
export class UserGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.headers["userid"] || request.userId;

        if (!userId)
            throw new UnauthorizedException("User ID is required");

        return true;
    }
}