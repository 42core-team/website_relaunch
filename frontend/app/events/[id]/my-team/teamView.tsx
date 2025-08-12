import { Team, TeamMember } from "@/app/actions/team";
import TeamCreationForm from "./components/TeamCreationForm";
import TeamInfoDisplay from "./components/TeamInfoDisplay";
import TeamInvitesDisplay from "./components/TeamInvitesDisplay";

interface TeamViewProps {
  initialTeam: Team | null;
  teamMembers: TeamMember[];
  pendingInvites: Team[];
}

export default function TeamView({
  initialTeam,
  teamMembers,
  pendingInvites,
}: TeamViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {!initialTeam ? (
        <>
          <TeamCreationForm />
          <div className="mt-8"></div>
          <TeamInvitesDisplay pendingInvites={pendingInvites} />
        </>
      ) : (
        <TeamInfoDisplay team={initialTeam} teamMembers={teamMembers} />
      )}
    </div>
  );
}
