"use client";

import { Button } from "@/components/clientHeroui";
import { useParams } from "next/navigation";
import { createSwissMatches } from "@/app/actions/tournament";

export default function Actions() {
  const params = useParams();

  return (
    <>
      <Button
        onPress={() => createSwissMatches(params.id as string)}
        color={"primary"}
      >
        Progress Tournament
      </Button>
    </>
  );
}
