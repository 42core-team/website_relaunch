'use client'

import {Button} from "@/components/clientHeroui";
import {calculateNextGroupPhaseMatches} from "@/app/actions/event";
import {useParams} from "next/navigation";

export default function Actions() {
    const params = useParams();

    return (
        <>
            <Button onPress={() => calculateNextGroupPhaseMatches(params?.id as string)} color={"primary"}>next </Button>
        </>
    );
}