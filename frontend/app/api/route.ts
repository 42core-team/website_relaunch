import {Request} from "next/dist/compiled/@edge-runtime/primitives";
import {AppDataSource, ensureDbConnected} from "@/initializer/database";
import {UserEntity} from "@/entities/users.entity";

export async function GET(request: Request) {
    await ensureDbConnected();

    await AppDataSource.getRepository(UserEntity).save({
        email: "test@test.de",
        username: "test",
        name: "test",
        profilePicture: "test"
    })

    return Response.json(await AppDataSource.getRepository(UserEntity).find());
}