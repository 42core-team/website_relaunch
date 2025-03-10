import NextAuth, {NextAuthOptions} from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { ensureDbConnected } from "@/initializer/database";
import { UserEntity } from "@/entities/users.entity";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            authorization: {
                params: {
                    scope: 'read:user user:email repo:invite'
                }
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "github") {
                const dataSource = await ensureDbConnected();
                const userRepository = dataSource.getRepository(UserEntity);
                const githubProfile = profile as any;

                const existingUser = await userRepository.findOne({
                    where: { githubId: account.providerAccountId }
                });

                if (!existingUser) {
                    await userRepository.save({
                        email: user.email!,
                        username: githubProfile?.login || user.name!,
                        name: user.name! || githubProfile?.name!,
                        profilePicture: user.image! || githubProfile?.avatar_url!,
                        githubId: account.providerAccountId,
                        githubAccessToken: account.access_token,
                    });
                } else {
                    await userRepository.update(
                        { id: existingUser.id },
                        {
                            githubId: account.providerAccountId,
                            githubAccessToken: account.access_token,
                            username: existingUser.username || githubProfile?.login || user.name!,
                            name: existingUser.name || user.name! || githubProfile?.name!,
                            profilePicture: existingUser.profilePicture || user.image! || githubProfile?.avatar_url!,
                        }
                    );
                }
            }
            return true;
        },
        async session({ session, token }) {
            const dataSource = await ensureDbConnected();
            const userRepository = dataSource.getRepository(UserEntity);
            const dbUser = await userRepository.findOne({
                where: { email: session.user?.email! }
            });

            if (dbUser) {
                session.user.id = dbUser.id;
            }
            return session;
        }
    }
}