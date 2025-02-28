import { useParams } from "next/navigation";
import { Button, Avatar, useDisclosure } from "@heroui/react";
import { Team, TeamMember } from "@/app/actions/team";
import TeamInviteModal from "./TeamInviteModal";

interface TeamInfoSectionProps {
    myTeam: Team, 
    onLeaveTeam: () => Promise<void>,
    isLeaving: boolean,
    teamMembers: TeamMember[]
}

export const TeamInfoSection = ({ 
    myTeam, 
    onLeaveTeam, 
    isLeaving, 
    teamMembers 
}: TeamInfoSectionProps) => {
    const eventId = useParams().id as string;
    const {isOpen, onOpen, onClose} = useDisclosure();
    
    return (
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
                    <p className="font-medium">{new Date(myTeam.createdAt || '').toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-sm text-default-500">Updated</p>
                    <p className="font-medium">{new Date(myTeam.updatedAt || '').toLocaleDateString()}</p>
                </div>
            </div>
            
            {/* Team Members Section */}
            <div className="mt-6 mb-8 p-4 bg-default-100 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <Button 
                        color="primary" 
                        size="sm" 
                        variant="flat"
                        onPress={onOpen}
                        startContent={<span className="text-lg">+</span>}
                    >
                        Invite Others
                    </Button>
                </div>
                <div className="flex flex-wrap gap-4">
                    {teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                            <div key={member.id} className="flex flex-col items-center">
                                <Avatar
                                    size="lg"
                                    src={member.profilePicture}
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

            {/* Invite Modal */}
            <TeamInviteModal 
                isOpen={isOpen} 
                onClose={onClose} 
                teamId={myTeam.id}
                eventId={eventId}
            />
        </div>
    );
};

export default TeamInfoSection; 