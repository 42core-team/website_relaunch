'use server'

import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export interface User {
    id: string;
    email: string;
    name: string
    created: string;
    updated: string;
}

export async function useUserData(): Promise<User> {
    const cookieStore = await cookies();
    const pbCookie = cookieStore.get('pb_auth');
    if (!pbCookie) {
        redirect('/login');
    }
    try {
        return JSON.parse(pbCookie.value).record as User;
    } catch (err) {
        redirect('/login');
    }
}