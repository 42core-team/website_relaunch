'use client'

import {Button} from "@/components/clientHeroui";
import {calculateNextGroupPhaseMatches, createSingleEliminationBracket} from "@/app/actions/event";
import {useParams} from "next/navigation";

export default function Actions() {
    const params = useParams();

    return (
        <>
            <Button onPress={() => createSingleEliminationBracket(params?.id as string)} color={"primary"}>next </Button>
        </>
    );
}