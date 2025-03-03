import { useParams } from "next/navigation";
import { Button, Avatar, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip } from "@heroui/react";
import { Team, TeamMember } from "@/app/actions/team";
import TeamInviteModal from "./TeamInviteModal";
import { useState } from "react";

interface TeamInfoSectionProps {
    myTeam: Team, 
    onLeaveTeam: () => Promise<boolean>,
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
    const {
        isOpen: isConfirmOpen,
        onOpen: onConfirmOpen,
        onClose: onConfirmClose
    } = useDisclosure();
    const [leaveError, setLeaveError] = useState<string | null>(null);

    const handleConfirmLeave = async () => {
        setLeaveError(null);
        onConfirmClose();
        const success = await onLeaveTeam();
        if (!success) {
            setLeaveError("Failed to leave team. Try refreshing the page or trying again later.");
        }
    };
    
    return (
        <div className="bg-default-50 p-6 rounded-lg border border-default-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Team: {myTeam.name}</h2>
                {myTeam.locked && (
                    <Chip color="warning" variant="flat">
                        Locked
                    </Chip>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-sm text-default-500">Repository</p>
                    <p className="font-medium">
                        {myTeam.repo ? (
                            <a 
                                href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_ORG}/${myTeam.repo}`}
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
                    {!myTeam.locked && (
                        <Button 
                            color="primary" 
                            size="sm" 
                            variant="flat"
                            onPress={onOpen}
                            startContent={<span className="text-lg">+</span>}
                        >
                            Invite Others
                        </Button>
                    )}
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
            <div className="mt-8 pt-4 border-t border-default-200">
                {leaveError && (
                    <div className="mb-4 px-4 py-3 rounded-md bg-danger-50 text-danger-700 border border-danger-200">
                        {leaveError}
                    </div>
                )}
                <div className="flex justify-end items-center">
                    {!myTeam.locked && (
                        <Button 
                            color="danger" 
                            variant="light"
                            onPress={onConfirmOpen}
                            size="sm"
                        >
                            Leave Team
                        </Button>
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            <TeamInviteModal 
                isOpen={isOpen} 
                onClose={onClose} 
                teamId={myTeam.id}
                eventId={eventId}
            />

            {/* Leave Team Confirmation Modal */}
            <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size="sm">
                <ModalContent>
                    <ModalHeader>
                        <h3 className="text-xl font-semibold">Leave Team</h3>
                    </ModalHeader>
                    <ModalBody>
                        <p>Are you sure you want to leave this team? This action cannot be undone.</p>
                        {teamMembers.length === 1 && (
                            <p className="mt-2 text-danger-500">
                                Warning: You are the last member of this team. Leaving will delete the team.
                            </p>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            color="default" 
                            variant="light" 
                            onPress={onConfirmClose}
                            className="mr-2"
                        >
                            Cancel
                        </Button>
                        <Button 
                            color="danger" 
                            onPress={handleConfirmLeave}
                            isLoading={isLeaving}
                        >
                            Leave Team
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default TeamInfoSection; 