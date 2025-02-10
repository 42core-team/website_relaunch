import DefaultLayout from "@/layouts/default";
import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Input} from "@heroui/input";
import {Button} from "@heroui/react";
import {GithubIcon} from "@/components/icons";
import pb from "@/pbase"
import {useRouter} from "next/router";


export default function Login() {
    const router = useRouter()
    async function githubLogin() {
        try{
            const authData = await pb.collection('users').authWithOAuth2({ provider: 'github' });
            if (authData) {
                router.push("dashboard")
            }
        }catch (error) {
            console.log("error while logging in");
        }
    }


    return (
        <DefaultLayout>
            <Card className="w-full max-w-[400px] mx-auto">
                <CardHeader>Login</CardHeader>
                <CardBody className="space-y-3">
                    <Input placeholder="Email" type="email" />
                    <Input placeholder="Password" type="password" />
                </CardBody>
                <CardFooter className="space-x-3">
                    <Button>Login</Button>
                    <Button onPress={githubLogin}>
                        Github
                        <GithubIcon/>
                    </Button>
                </CardFooter>
            </Card>
        </DefaultLayout>
    )
}