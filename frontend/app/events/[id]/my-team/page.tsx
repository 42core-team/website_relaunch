import TeamView from "./teamView";
import {getTeam} from "@/app/actions/team";
import {useUserData} from "@/app/actions/user";

export default async function Page({params}: {params: Promise<{id: string}>}) {
    const user = await useUserData();
    const team = await getTeam(user.id, (await params).id);
    return (
        <TeamView
            initialTeam={team}
        />
    );
}