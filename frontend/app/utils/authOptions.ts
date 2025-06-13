import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import axiosInstance from "@/app/actions/axios";

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

        const existingUser = (
          await axiosInstance.get(`user/github/${account.providerAccountId}`)
        ).data;
        console.log("auth user", existingUser == null, profile.email);
        if (!existingUser) {
          if (!account?.access_token) {
            throw new Error("No access token found");
          }

          const response = await axiosInstance.post(`user/`, {
            email: user.email!,
            username: githubProfile?.login || user.name!,
            name: user.name! || githubProfile?.name!,
            profilePicture: user.image! || githubProfile?.avatar_url!,
            githubId: account.providerAccountId,
            githubAccessToken: account.access_token,
            canCreateEvent: false,
          });

          console.log(response);
        } else {
          await axiosInstance.put(`user/${existingUser.id}`, {
            email: user.email!,
            username: githubProfile?.login || existingUser.username,
            name: githubProfile?.name || existingUser.name,
            profilePicture:
              githubProfile?.avatar_url || existingUser.profilePicture,
            githubId: account.providerAccountId,
            githubAccessToken: account.access_token,
            canCreateEvent: existingUser.canCreateEvent,
          });
        }
      }
      return true;
    },
    async session({ session }) {
      if (!session.user?.email) {
        throw new Error("User email is not available in session");
      }

      const dbUser = (
        await axiosInstance.get(`user/email/${session.user?.email!}`)
      ).data;
      if (dbUser) session.user.id = dbUser.id;
      return session;
    },
  },
};
