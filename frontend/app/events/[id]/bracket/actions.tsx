"use client";

import { Button } from "@/components/clientHeroui";

import { useParams } from "next/navigation";

export default function Actions() {
  const params = useParams();

  return (
    <>
      <Button color={"primary"}>next </Button>
    </>
  );
}
