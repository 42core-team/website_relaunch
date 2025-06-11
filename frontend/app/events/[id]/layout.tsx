import React from "react";
import EventLayout from "@/layouts/event";

export default async function App({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return <EventLayout params={await params}>{children}</EventLayout>;
}
