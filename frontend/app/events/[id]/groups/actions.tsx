"use client";

import { Button } from "@/components/clientHeroui";
import { useParams } from "next/navigation";
import { startSwissMatches } from "@/app/actions/tournament";

export default function Actions() {
  const params = useParams();

  return (
    <>
      <Button
        onPress={() => startSwissMatches(params.id as string)}
        color={"primary"}
      >
        Progress Tournament
      </Button>
    </>
  );
}
