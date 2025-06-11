import { prisma } from "@/initializer/database";
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo:invite",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        const githubProfile = profile as any;

        const existingUser = await prisma.user.findUnique({
          where: { githubId: account.providerAccountId },
        });

        if (!existingUser) {
          if (!account?.access_token) {
            throw new Error("No access token found");
          }

          await prisma.user.create({
            data: {
              email: user.email!,
              username: githubProfile?.login || user.name!,
              name: user.name! || githubProfile?.name!,
              profilePicture: user.image! || githubProfile?.avatar_url!,
              githubId: account.providerAccountId,
              githubAccessToken: account.access_token,
              canCreateEvent: false,
            },
          });
        } else {
          await prisma.user.update({
            where: { githubId: account.providerAccountId },
            data: {
              githubId: account.providerAccountId,
              githubAccessToken: account.access_token,
              username: githubProfile?.login || existingUser.username,
              name: githubProfile?.name || existingUser.name,
              profilePicture:
                githubProfile?.avatar_url || existingUser.profilePicture,
            },
          });
        }
      }
      return true;
    },
    async session({ session }) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user?.email! },
        select: {
          id: true,
        },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
      }
      return session;
    },
  },
};
