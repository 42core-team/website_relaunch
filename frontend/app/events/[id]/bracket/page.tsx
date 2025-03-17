import {ensureDbConnected} from "@/initializer/database";
import {MatchEntity, MatchPhase} from "@/entities/match.entity";
import GraphView from "@/app/events/[id]/groups/graphView";
import Actions from "@/app/events/[id]/bracket/actions";

export default async function page({ params }: { params: Promise<{ id: string }> }){
    const connection = await ensureDbConnected();
    const eventId = (await params).id;
    const matches = await connection.getRepository(MatchEntity).find({
        where: {
            phase: MatchPhase.ELIMINATION,
            teams: {
                event: {
                    id: eventId
                }
            }
        },
        relations: {
            teams: true,
            winner: true
        }
    });

    const serializedMatches = matches.map(match => ({
        id: match.id,
        state: match.state,
        round: match.round,
        winner: match.winner ? {
            id: match.winner.id,
            name: match.winner.name,
        } : null,
        teams: match.teams ? match.teams.map(team => ({
            id: team.id,
            name: team.name,
        })) : [],
        createdAt: match.createdAt,
        updatedAt: match.updatedAt
    }));

    console.log(matches, eventId);

    return (
        <div>
            <div className="flex gap-2">
                <Actions/>
            </div>
            <h1>Group phase</h1>
            <p>Group phase is the first phase of the tournament where teams are divided into groups and play against each other.</p>
            <GraphView matches={serializedMatches as MatchEntity[]} />
        </div>
    )
}