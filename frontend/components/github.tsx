import { Button } from "@heroui/react";
import { GithubIcon } from "./icons";
import { signIn } from "next-auth/react";

export default function GithubLoginButton() {
  async function githubLogin() {
    try {
      await signIn("github");
    } catch (error) {
      console.log("error while logging in:", error);
    }
  }

  return (
    <Button variant="flat" onPress={githubLogin} startContent={<GithubIcon />}>
      Login
    </Button>
  );
}
