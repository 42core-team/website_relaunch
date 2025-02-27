import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { ensureDbConnected } from "@/initializer/database";
import { User } from "@/entities/users.entity";

const handler = NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "github") {
                const dataSource = await ensureDbConnected();
                const userRepository = dataSource.getRepository(User);

                const existingUser = await userRepository.findOne({
                    where: { email: user.email! }
                });

                if (!existingUser) {
                    await userRepository.save({
                        email: user.email!,
                        username: profile?.login || user.name!,
                    });
                }
            }
            return true;
        },
        async session({ session, token }) {
            const dataSource = await ensureDbConnected();
            const userRepository = dataSource.getRepository(User);
            const dbUser = await userRepository.findOne({
                where: { email: session.user?.email! }
            });

            if (dbUser) {
                session.user.id = dbUser.id;
            }
            return session;
        }
    }
});

export { handler as GET, handler as POST };