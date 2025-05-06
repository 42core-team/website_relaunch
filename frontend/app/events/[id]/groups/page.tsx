import GraphView from "@/app/events/[id]/groups/graphView";
import Actions from "@/app/events/[id]/groups/actions";
import { notFound } from 'next/navigation';
import { prisma } from "@/initializer/database";
import { events_type_enum, matches_phase_enum } from "@/generated/prisma";

export default async function page({ params }: { params: Promise<{ id: string }> }){
    const eventId = (await params).id;
    
    const event = await prisma.event.findUnique({
        where: { id: eventId }
    });
    
    if (event?.type === events_type_enum.RUSH) {
        return notFound();
    }
    
    const matches = await prisma.match.findMany({
        where: {
            phase: matches_phase_enum.SWISS,
            matchTeams: {
                some: {
                    team: {
                        eventId: eventId
                    },
                },
            },
        },
        include: {
            matchTeams: {
                include: {
                    team: {
                        select: {
                            name: true,
                        }
                    }
                },
            },
            winner: true,
        },
    });

    const serializedMatches = matches.map(match => ({
        id: match.id,
        state: match.state,
        round: match.round,
        winner: match.winner ? {
            id: match.winner.id,
            name: match.winner.name,
        } : null,
        teams: match.matchTeams.map(team => ({
            id: team.teamsId,
            name: team.team.name,
        })),
        createdAt: match.createdAt,
        updatedAt: match.updatedAt
    }));

    return (
        <div>
            <div className="flex gap-2">
                <Actions/>
            </div>
            <h1>Group phase</h1>
            <p>Group phase is the first phase of the tournament where teams are divided into groups and play against each other.</p>
            <GraphView matches={serializedMatches} />
        </div>
    )
}