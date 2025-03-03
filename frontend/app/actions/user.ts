'use server'

import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import { ensureDbConnected } from "@/initializer/database";
import { UserEntity } from "@/entities/users.entity";

export interface User {
    id: string;
    email: string;
    name: string
    created?: string;
    updated?: string;
    createdAt?: Date;
}

export async function useUserData(): Promise<User> {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth_user');
    if (!authCookie) {
        redirect('/login');
    }
    try {
        const userId = authCookie.value;
        const dataSource = await ensureDbConnected();
        const userRepository = dataSource.getRepository(UserEntity);
        const user = await userRepository.findOne({ where: { id: userId } });
        
        if (!user) {
            redirect('/login');
        }
        
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        };
    } catch (err) {
        redirect('/login');
    }
}