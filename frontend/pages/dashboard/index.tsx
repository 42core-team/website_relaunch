"use client"
import pb from "@/pbase"
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {Button} from "@heroui/react";

export default function Index() {
    const router = useRouter()
    const [auth, setAuth] = useState(false)

    useEffect(() => {
        if(!pb.authStore.isValid || !pb.authStore.record){
            router.push("login")
            return;
        }else
            setAuth(true)
    }, [])

    if(!auth){
        return <h1>loading..</h1>
    }

    return (
        <div>
            <h1>Welcome: {pb.authStore.record?.name}</h1>
            <Button onPress={() => {
                pb.authStore.clear()
                router.push("/login")
            }} color="danger" variant="bordered">Logout</Button>
        </div>
    )
}