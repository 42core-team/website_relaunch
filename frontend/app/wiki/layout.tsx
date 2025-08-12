"use client";

import "@/styles/globals.css";
import { Head } from "@/layouts/head";

export default function WikiLayout({
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
