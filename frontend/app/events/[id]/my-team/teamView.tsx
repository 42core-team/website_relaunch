'use client'
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
    createTeam, 
    Team, 
    leaveTeam, 
    getTeamMembers, 
    TeamMember 
} from "@/app/actions/team";
import { 
    TeamCreationSection, 
    TeamInfoSection, 
    TeamInvitesSection 
} from "@/components/team";

export default function Page({ initialTeam }: { initialTeam: Team | null }) {
    const [myTeam, setMyTeam] = useState(initialTeam);
    const [newTeamName, setNewTeamName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const eventId = useParams().id as string;
    const router = useRouter();
    const { data: session } = useSession();
    
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

        if (!session || !session.user || !session.user.id) {
            console.error("User not authenticated");
            return;
        }

        try {
            setIsLoading(true);
            const team: Team = await createTeam(newTeamName, eventId, session.user.id);
            setMyTeam(team);
        } catch (err) {
            console.error("Error creating team:", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleLeaveTeam() {
        if (!myTeam || !session || !session.user || !session.user.id) {
            console.error("No team to leave or user not authenticated");
            return;
        }

        try {
            setIsLeaving(true);
            const success = await leaveTeam(myTeam.id, session.user.id);
            
            if (success) {
                setMyTeam(null);
                setTeamMembers([]);
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
                <>
                    <TeamCreationSection 
                        newTeamName={newTeamName} 
                        setNewTeamName={setNewTeamName} 
                        handleCreateTeam={handleCreateTeam} 
                        isLoading={isLoading} 
                    />
                    {/* Show Team Invites section when user doesn't have a team */}
                    <TeamInvitesSection />
                </>
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
