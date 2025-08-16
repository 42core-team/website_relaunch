"use client";
import { useEffect, useState } from "react";
import { Button, cn } from "@heroui/react";
// @ts-ignore
import { QueueState } from "@/app/actions/team.model";
import { getQueueState, joinQueue, Team } from "@/app/actions/team";
import { Match, MatchState } from "@/app/actions/tournament-model";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function QueueState(props: {
  queueState: QueueState;
  eventId: string;
  team: Team;
  queueMatches: Match[];
}) {
  const [queueState, setQueueState] = useState<QueueState>(props.queueState);
  const [joiningQueue, setJoiningQueue] = useState(false);

  const router = useRouter();
  const { id } = useParams();
  const eventId = id as string;

  useEffect(() => {
    async function fetchQueueState() {
      const newQueueState = await getQueueState(props.eventId);
      if (
        queueState.match?.state === MatchState.IN_PROGRESS &&
        newQueueState.match?.state !== MatchState.IN_PROGRESS
      ) {
        if (newQueueState.match) {
          router.push(`/events/${eventId}/match/${newQueueState?.match?.id}`);
        }
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

      <div className="mt-8 w-full max-w-2xl">
        <h2 className="mb-4 text-xl font-semibold">Past Matches</h2>
        {props.queueMatches.length === 0 ? (
          <p className="text-center text-default-500">No past matches found</p>
        ) : (
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto">
            {props.queueMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-lg border border-default-200 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-default-500">
                    Match ID: {match.id}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      match.state === MatchState.FINISHED
                        ? "bg-success-100 text-success-700"
                        : match.state === MatchState.IN_PROGRESS
                          ? "bg-warning-100 text-warning-700"
                          : "bg-default-100 text-default-700",
                    )}
                  >
                    {match.state}
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {match.results.length == 2 && (
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={cn(
                          "flex-1 text-center py-2 px-3 rounded-md",
                          match.winner?.name === match.teams[0].name
                            ? "bg-success-50 border border-success-200"
                            : "",
                        )}
                      >
                        <div className="font-medium">
                          {match.teams[0].name}
                          {match.winner?.id === match.teams[0].id && (
                            <span className="ml-2">👑</span>
                          )}
                        </div>
                        <div className="text-xl font-bold mt-1">
                          {match.results.find(
                            (result) => result.team.id === match.teams[0].id,
                          )?.score || 0}
                        </div>
                      </div>

                      <div className="text-default-500 font-bold">VS</div>

                      <div
                        className={cn(
                          "flex-1 text-center py-2 px-3 rounded-md",
                          match.winner?.name === match.teams[1].name
                            ? "bg-success-50 border border-success-200"
                            : "",
                        )}
                      >
                        <div className="font-medium">
                          {match.teams[1].name}
                          {match.winner?.id === match.teams[1].id && (
                            <span className="ml-2">👑</span>
                          )}
                        </div>
                        <div className="text-xl font-bold mt-1">
                          {match.results.find(
                            (result) => result.team.id === match.teams[1].id,
                          )?.score || 0}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-default-400 flex justify-between items-center">
                  <span>{new Date(match.createdAt).toLocaleString()}</span>
                  <Link
                    href={"/events/" + props.eventId + "/match/" + match.id}
                  >
                    <Button size="sm" color="secondary">
                      Replay
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
