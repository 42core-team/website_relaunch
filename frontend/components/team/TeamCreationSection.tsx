import { Button } from "@heroui/react";
import { Input } from "@heroui/input";

interface TeamCreationSectionProps {
    newTeamName: string;
    setNewTeamName: (name: string) => void;
    handleCreateTeam: () => Promise<void>;
    isLoading: boolean;
}

export const TeamCreationSection = ({ 
    newTeamName, 
    setNewTeamName, 
    handleCreateTeam, 
    isLoading 
}: TeamCreationSectionProps) => (
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

export default TeamCreationSection; 