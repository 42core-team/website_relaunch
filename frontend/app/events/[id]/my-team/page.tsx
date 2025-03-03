'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import TeamView from "./teamView";
import { getTeam, Team } from "@/app/actions/team";
import { isUserRegisteredForEvent } from "@/app/actions/event";

export default function Page() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;
    const [isLoading, setIsLoading] = useState(true);
    const [team, setTeam] = useState<Team | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        async function checkUserAndLoadTeam() {
            if (status === 'loading') return;
            
            if (!session || !session.user || !session.user.id) {
                router.push('/login');
                return;
            }

            try {
                const userRegistered = await isUserRegisteredForEvent(session.user.id, eventId);
                setIsRegistered(userRegistered);
                
                if (!userRegistered) {
                    router.push(`/events/${eventId}`);
                    return;
                }
                
                const userTeam = await getTeam(session.user.id, eventId);
                setTeam(userTeam);
            } catch (error) {
                console.error('Error loading team data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        checkUserAndLoadTeam();
    }, [session, status, eventId, router]);

    if (status === 'loading' || isLoading) {
        return <div className="text-center py-8">Loading your team...</div>;
    }

    if (!isRegistered) {
        return null;
    }

    return <TeamView initialTeam={team} />;
}