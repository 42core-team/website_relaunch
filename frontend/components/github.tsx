import pb from "@/pbase"
import { Button } from "@heroui/react"
import { GithubIcon } from "./icons"
import {signIn} from "next-auth/react";

export default function GithubLoginButton() {
    async function githubLogin() {
        try {
           const response = await signIn("github")
            console.log(response);

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