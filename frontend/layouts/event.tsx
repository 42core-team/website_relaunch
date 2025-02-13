import { Head } from "./head";
import BasicNavbar from "./basic-navbar";
import EventNavbar from "@/components/event-navbar";
import Footer from "./footer";

export default function EventLayout({
    children,
    eventId,
}: {
    children: React.ReactNode;
    eventId: string;
}) {
    return (
        <div className="relative flex flex-col h-screen">
          <Head />
          <BasicNavbar />
          <EventNavbar eventId={eventId} />
          <main className="container mx-auto max-w-7xl px-6 flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      );
}