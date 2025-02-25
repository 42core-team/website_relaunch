'use client'
import { useState} from "react";
import pb from "@/pbase";
import {useParams} from "next/navigation";
import {Button} from "@heroui/react";
import {Input} from "@heroui/input";
import {createTeam, Team} from "@/app/actions/team";

const TeamCreationSection = ({ 
    newTeamName, 
    setNewTeamName, 
    handleCreateTeam, 
    isLoading 
}: { 
    newTeamName: string;
    setNewTeamName: (name: string) => void;
    handleCreateTeam: () => Promise<void>;
    isLoading: boolean;
}) => (
    <div className="bg-default-50 p-6 rounded-lg border border-default-200">
        <h2 className="text-xl font-semibold mb-4">Create Your Team</h2>
        <div className="flex gap-2">
            <Input 
                label="Team Name" 
                placeholder="Enter team name" 
                value={newTeamName} 
                onChange={e => setNewTeamName(e.target.value)} 
                className="flex-1"
            />
            <Button 
                color="primary" 
                onPress={handleCreateTeam}
                isLoading={isLoading}
                isDisabled={!newTeamName}
            >
                Create Team
            </Button>
        </div>
    </div>
);

const TeamInfoSection = ({ myTeam }: { myTeam: Team }) => (
    <div className="bg-default-50 p-6 rounded-lg border border-default-200">
        <h2 className="text-2xl font-bold mb-4">Team: {myTeam.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <p className="text-sm text-default-500">Repository</p>
                <p className="font-medium">
                    {myTeam.repo ? (
                        <a 
                            href={myTeam.repo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            {myTeam.repo}
                        </a>
                    ) : (
                        "Not yet configured"
                    )}
                </p>
            </div>
            <div>
                <p className="text-sm text-default-500">Created</p>
                <p className="font-medium">{new Date(myTeam.created).toLocaleDateString()}</p>
            </div>
            <div>
                <p className="text-sm text-default-500">Updated</p>
                <p className="font-medium">{new Date(myTeam.updated).toLocaleDateString()}</p>
            </div>
        </div>
    </div>
);

export default function Page({ initialTeam }: { initialTeam: Team | null }) {
    const [myTeam, setMyTeam] = useState(initialTeam);
    const [newTeamName, setNewTeamName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
            setIsLoading(true);
            const team: Team = await createTeam(newTeamName, eventId, pb.authStore.record.id);
            setMyTeam(team);
        } catch (err) {
            console.error("Error creating team:", err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {!myTeam ? (
                <TeamCreationSection 
                    newTeamName={newTeamName} 
                    setNewTeamName={setNewTeamName} 
                    handleCreateTeam={handleCreateTeam} 
                    isLoading={isLoading} 
                />
            ) : (
                <TeamInfoSection myTeam={myTeam} />
            )}
        </div>
    );
}
