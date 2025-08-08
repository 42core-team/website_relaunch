"use client";
import { useEffect, useState } from "react";
import { Button, cn } from "@heroui/react";
// @ts-ignore
import { QueueState } from "@/app/actions/team.model";
import { getQueueState, joinQueue, Team } from "@/app/actions/team";
import { MatchState } from "@/app/actions/tournament-model";
import { Spinner } from "@heroui/spinner";

export default function QueueState(props: {
  queueState: QueueState;
  eventId: string;
  team: Team;
}) {
  const [queueState, setQueueState] = useState<QueueState>(props.queueState);
  const [joiningQueue, setJoiningQueue] = useState(false);

  useEffect(() => {
    async function fetchQueueState() {
      const newQueueState = await getQueueState(props.eventId);
      if (
        queueState.match?.state === MatchState.IN_PROGRESS &&
        newQueueState.match?.state !== MatchState.IN_PROGRESS
      ) {
        console.log(
          "Match has ended, resetting queue state.",
          newQueueState.match,
        );
      }
      setQueueState(newQueueState);
    }

    const interval = setInterval(fetchQueueState, 600);
    return () => clearInterval(interval);
  });

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1 className="text-2xl font-bold">Queue State</h1>
      <div className="mt-4 flex flex-col items-center justify-center gap-2">
        {queueState?.match?.state === MatchState.IN_PROGRESS ? (
          <Spinner color="success" />
        ) : (
          <>
            <p className="text-lg">Team: {props.team.name}</p>
            <p
              className={cn(
                "text-sm text-default-500",
                queueState.inQueue ? "text-green-500" : "",
              )}
            >
              Status: {queueState.inQueue ? "In Queue" : "Not in Queue"}
            </p>
            {!queueState.inQueue ? (
              <Button
                isDisabled={joiningQueue}
                onPress={() => {
                  setJoiningQueue(true);
                  joinQueue(props.eventId)
                    .then(() => {
                      setQueueState({
                        ...queueState,
                        inQueue: true,
                        queueCount: queueState.queueCount + 1,
                      });
                    })
                    .finally(() => {
                      setJoiningQueue(false);
                    });
                }}
                color="success"
              >
                play
              </Button>
            ) : (
              <>
                <p className="text-sm">Queue Count: {queueState.queueCount}</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
