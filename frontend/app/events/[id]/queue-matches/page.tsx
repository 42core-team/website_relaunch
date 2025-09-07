import {Metadata} from "next";
import {getQueueMatchesAdmin} from "@/app/actions/team";
import {isActionError} from "@/app/actions/errors";
import {isEventAdmin} from "@/app/actions/event";
import QueueMatchesList from "@/components/QueueMatchesList";
import QueueMatchesChart from "@/components/QueueMatchesChart";
import {getQueueMatchesTimeSeries} from "@/app/actions/stats";

export const metadata: Metadata = {
    title: "Queue Matches",
    description: "List of all queue matches for this event (admins only)",
};

export default async function EventQueueMatchesAdminPage({
                                                             params,
                                                             searchParams,
                                                         }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ hours?: string, interval?: string }>,
}) {
    const {id} = await params;

    const admin = await isEventAdmin(id);
    if (isActionError(admin) || !admin) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    const timeSeriesHours = parseInt((await searchParams).hours || "24", 10);
    if (isNaN(timeSeriesHours) || timeSeriesHours <= 0) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <p>Invalid hours parameter. Please provide a number between 1 and 168.</p>
            </div>
        );
    }
    const interval = (await searchParams).interval || "hour";
    if (interval !== "hour" && interval !== "day" && interval != "minute") {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <p>Invalid interval parameter. Please provide either "hour" or "day".</p>
            </div>
        );
    }

    const [matches, series] = await Promise.all([
        getQueueMatchesAdmin(id),
        getQueueMatchesTimeSeries(id, interval, timeSeriesHours),
    ])

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">All Queue Matches</h1>

            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Matches played (last 24h)</h2>
                <QueueMatchesChart data={series}/>
            </div>

            <QueueMatchesList eventId={id} matches={matches}/>
        </div>
    );
}
