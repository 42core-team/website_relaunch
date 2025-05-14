"use server";

import { prisma } from "@/initializer/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name: string;
  created?: string;
  updated?: string;
  createdAt?: Date;
}

export async function useUserData(): Promise<User> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth_user");
  if (!authCookie) {
    redirect("/login");
  }
  try {
    const userId = authCookie.value;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      redirect("/login");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  } catch (err) {
    redirect("/login");
  }
}
