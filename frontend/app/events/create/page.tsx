import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";
import { canUserCreateEvent } from "@/app/actions/event";
import { title } from "@/components/primitives";
import CreateEventForm from "./CreateEventForm";

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/events");
  }

  const hasPermission = await canUserCreateEvent();
  if (!hasPermission) {
    redirect("/events");
  }

  return (
    <div className="container mx-auto py-3 max-w-3xl min-h-lvh">
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-6 mb-8">
        <h1 className={title()}>Create New Event</h1>
      </div>

      <CreateEventForm />
    </div>
  );
}
