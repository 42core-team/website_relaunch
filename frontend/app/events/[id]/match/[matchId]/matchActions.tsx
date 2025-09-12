"use client";

import {Button} from "@heroui/button";
import {useState} from "react";
import {revealMatch} from "@/app/actions/tournament";

export default function MatchActions(props: { matchId: string, isMatchRevealed: boolean }) {
    const [loading, setLoading] = useState(false);
    const [revealed, setRevealed] = useState(props.isMatchRevealed);

    return (
        <div className="flex">
            <Button
                onPress={() => {
                    setLoading(true);
                    revealMatch(props.matchId).finally(() => {
                        setLoading(false);
                        setRevealed(true);
                    });
                }}
                isDisabled={loading || revealed}
                color={revealed ? "success" : "secondary"}
            >
                Reveal
            </Button>
        </div>
    );
}
