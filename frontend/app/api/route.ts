import {Request} from "next/dist/compiled/@edge-runtime/primitives";
import "@/initializer/database";
import {UserEntity} from "@/entities/users.entity";
import {AppDataSource, ensureDbConnected} from "@/initializer/database";

export async function GET(request: Request) {
    await ensureDbConnected()
    const users = await AppDataSource.getRepository(UserEntity).find();
    return Response.json({message: "Hello, world!", users});
}