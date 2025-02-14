'use client'
import { useState} from "react";
import pb from "@/pbase";
import {useParams} from "next/navigation";
import {Button} from "@heroui/react";
import {Input} from "@heroui/input";
import {createTeam, Team} from "@/app/actions/team";

export default function Page({initialTeam}: {initialTeam: Team | null}) {
    const [myTeam, setMyTeam] = useState(initialTeam);
    const [newTeamName, setNewTeamName] = useState("");
    const eventId = useParams().id as string;

    async function handleCreateTeam() {
        if (!newTeamName) {
            console.error("No team name provided");
            return;
        }

        if (!pb.authStore.isValid || !pb.authStore.record?.id) {
            console.error("User not authenticated");
            return;
        }

        try {
            const team: Team = await createTeam(newTeamName, eventId, pb.authStore.record.id);
            setMyTeam(team);
        } catch (err) {
            console.error("Error creating team:", err);
        }
    }

    return (
        <div>
            {!myTeam ? (
                <div className="flex justify-center items-center h-96 flex-col gap-2 w-full max-w-[400px] mx-auto">
                    <p className="text-2xl text-default-500">Create a new team</p>

                    <div className="flex gap-2">
                        <Input onChange={e => setNewTeamName(e.target.value)} placeholder="Page name"/>
                        <Button onPress={handleCreateTeam} color="primary">Create</Button>
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold">Team: {myTeam.name}</h2>
                    <p>Repo: {myTeam.repo}</p>
                    <p>Created: {myTeam.created}</p>
                    <p>Updated: {myTeam.updated}</p>
                </div>
            )}
        </div>
    )
}
