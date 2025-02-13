import pb from "@/pbase"
import { Button } from "@heroui/react"
import { GithubIcon } from "./icons"

export default function GithubLoginButton() {
    async function githubLogin() {
        try {
            await pb.collection('users').authWithOAuth2({ provider: 'github' });
        } catch (error) {
            console.log("error while logging in");
        }
    }

    return (
        <Button
            variant="flat"
            onPress={githubLogin}
            startContent={<GithubIcon />}
        >
            Login
        </Button>
    )
}