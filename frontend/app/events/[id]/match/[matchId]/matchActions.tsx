"use client";

import { Button } from "@heroui/button";
import { useState } from "react";
import { revealMatch } from "@/app/actions/tournament";

export default function MatchActions(props: { matchId: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex">
      <Button
        onPress={() => {
          setLoading(true);
          revealMatch(props.matchId).finally(() => setLoading(false));
        }}
        isDisabled={loading}
        color="secondary"
      >
        Reveal
      </Button>
    </div>
  );
}
