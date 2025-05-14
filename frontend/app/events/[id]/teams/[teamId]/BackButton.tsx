"use client";

import { ArrowLeftIcon } from "@/components/icons";
import { Button } from "@heroui/react";

export default function BackButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      className="p-2"
      aria-label="Back to teams list"
      onPress={() => {
        window.history.back();
      }}
    >
      <ArrowLeftIcon size={20} />
    </Button>
  );
}
