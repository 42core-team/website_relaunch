import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import TeamView from "./teamView";
import {getTeam} from "@/app/actions/team";

export default async function Page({params}: {params: Promise<{id: string}>}) {
    const cookieStore = await cookies();
    const pbCookie = cookieStore.get('pb_auth');

    if (!pbCookie) {
        redirect('/login');
    }

    const userId: string = JSON.parse(pbCookie.value).record.id;
    const team = await getTeam(userId, (await params).id);
    return (
        <TeamView
            initialTeam={team}
        />
    );
}