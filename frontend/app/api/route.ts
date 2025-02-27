import {Request} from "next/dist/compiled/@edge-runtime/primitives";
import {AppDataSource, ensureDbConnected} from "@/initializer/database";
import {User} from "@/entities/users.entity";

export async function GET(request: Request) {
    await ensureDbConnected();

    await AppDataSource.getRepository(User).save({
        email: "test@test.de",
        username: "test",
    })

    return Response.json(await AppDataSource.getRepository(User).find())
}