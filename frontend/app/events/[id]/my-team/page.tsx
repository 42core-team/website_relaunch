import TeamView from "./teamView";
import {getTeam} from "@/app/actions/team";
import {useUserData} from "@/app/actions/user";
import {isUserRegisteredForEvent} from "@/app/actions/event";
import {redirect} from "next/navigation";

export default async function Page({params}: {params: Promise<{id: string}>}) {
    const user = await useUserData();
    const eventId = (await params).id;
    
    //TODO: refactor this to a layout so it will be checked everytime in the event area
    // Check if user is registered for this event
    const isRegistered = await isUserRegisteredForEvent(user.id, eventId);
    
    if (!isRegistered) {
        redirect(`/events/${eventId}`);
    }
    
    const team = await getTeam(user.id, eventId);
    return (
        <TeamView
            initialTeam={team}
        />
    );
}