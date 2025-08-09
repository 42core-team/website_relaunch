import { PrismaClient } from "@/generated/prisma";

export const prisma = new PrismaClient({
  log: ["info", "warn", "error"],
});
