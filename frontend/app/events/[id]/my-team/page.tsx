import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { redirect } from "next/navigation";
import { getTeam, Team } from "@/app/actions/team";
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
  const userId = session.user.id;

  const userRegistered = await isUserRegisteredForEvent(userId);
  if (!userRegistered) {
    redirect(`/events/${eventId}`);
  }

  const team = await getTeam(userId, eventId);

  return <TeamView initialTeam={team} />;
}
