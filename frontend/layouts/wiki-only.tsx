import { Head } from "./head";

export default function WikiOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-lvh">
      <Head />
      {children}
    </div>
  );
}
