'use client'

import {Button} from "@/components/clientHeroui";
import {calculateNextGroupPhaseMatches} from "@/app/actions/event";
import { useParams } from "next/navigation";
import { increaseRound } from "@/app/actions/tournament";

export default function Actions() {
    const params = useParams();

    return (
        <>
            <Button onPress={() => increaseRound(params?.id as string)} color={"primary"}>Progress Tournament</Button>
        </>
    );
}