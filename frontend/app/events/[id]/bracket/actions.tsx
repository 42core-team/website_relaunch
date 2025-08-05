"use client";

import { Button } from "@/components/clientHeroui";

import { useParams } from "next/navigation";
import { startTournamentMatches } from "@/app/actions/tournament";

export default function Actions() {
  const params = useParams();

  return (
    <>
      <Button
        color={"primary"}
        onPress={() => startTournamentMatches(params.id as string)}
      >
        start{" "}
      </Button>
    </>
  );
}
