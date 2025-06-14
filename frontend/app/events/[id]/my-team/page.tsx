import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { redirect } from "next/navigation";
import { getMyEventTeam, Team } from "@/app/actions/team";
import { isUserRegisteredForEvent } from "@/app/actions/event";
import TeamView from "./teamView";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const eventId = (await params).id;

  const userRegistered = await isUserRegisteredForEvent(eventId);
  if (!userRegistered) {
    redirect(`/events/${eventId}`);
  }

  const team = await getMyEventTeam(eventId);

  return <TeamView initialTeam={team} />;
}
