'use client'
import { useState, useEffect } from "react";
import pb from "@/pbase";
import {useParams, useRouter} from "next/navigation";
import {Button, Avatar} from "@heroui/react";
import {Input} from "@heroui/input";
import {createTeam, Team, leaveTeam, TeamMember, getTeamMembers} from "@/app/actions/team";

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

const TeamInfoSection = ({ myTeam, onLeaveTeam, isLeaving, teamMembers }: { 
    myTeam: Team, 
    onLeaveTeam: () => Promise<void>,
    isLeaving: boolean,
    teamMembers: TeamMember[]
}) => (
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
        
        {/* Team Members Section */}
        <div className="mt-6 mb-8 p-4 bg-default-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Team Members</h3>
            <div className="flex flex-wrap gap-4">
                {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                        <div key={member.id} className="flex flex-col items-center">
                            <Avatar
                                size="lg"
                                src={
                                    member.avatar
                                        ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${member.collectionId}/${member.id}/${member.avatar}?thumb=100x100`
                                        : undefined
                                }
                                name={(member.name || "User").substring(0, 2).toUpperCase()}
                                className="mb-2"
                            />
                            <span className="text-sm font-medium">@{member.username}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-default-500">No team members found</p>
                )}
            </div>
        </div>
        
        {/* Team Management Compartment */}
        <div className="mt-8 pt-4 border-t border-default-200 flex justify-end items-center">
            <Button 
                color="danger" 
                variant="light"
                onPress={onLeaveTeam}
                isLoading={isLeaving}
                size="sm"
            >
                Leave Team
            </Button>
        </div>
    </div>
);

export default function Page({ initialTeam }: { initialTeam: Team | null }) {
    const [myTeam, setMyTeam] = useState(initialTeam);
    const [newTeamName, setNewTeamName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const eventId = useParams().id as string;
    const router = useRouter();
    
    // Fetch team members when team changes
    useEffect(() => {
        async function fetchTeamMembers() {
            if (myTeam) {
                try {
                    const members = await getTeamMembers(myTeam.id);
                    setTeamMembers(members);
                } catch (error) {
                    console.error("Error fetching team members:", error);
                }
            }
        }
        
        fetchTeamMembers();
    }, [myTeam]);

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

    async function handleLeaveTeam() {
        if (!myTeam || !pb.authStore.isValid || !pb.authStore.record?.id) {
            console.error("No team to leave or user not authenticated");
            return;
        }

        try {
            setIsLeaving(true);
            const success = await leaveTeam(myTeam.id, pb.authStore.record.id);
            
            if (success) {
                setMyTeam(null);
                setTeamMembers([]);
                // Optional: refresh the page or show a success message
                router.refresh();
            } else {
                console.error("Failed to leave team");
            }
        } catch (err) {
            console.error("Error leaving team:", err);
        } finally {
            setIsLeaving(false);
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
                <TeamInfoSection 
                    myTeam={myTeam} 
                    onLeaveTeam={handleLeaveTeam}
                    isLeaving={isLeaving}
                    teamMembers={teamMembers}
                />
            )}
        </div>
    );
}
