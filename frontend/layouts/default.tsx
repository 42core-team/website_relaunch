import { Head } from "./head";

import BasicNavbar from "./basic-navbar";
import Footer from "./footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen overflow-x-hidden">
      <Head />
      <BasicNavbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
