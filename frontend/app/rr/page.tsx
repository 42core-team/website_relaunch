"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default async function RickRollPage() {
  const shouldRedirectToVideo = Math.random() < 0.5;
  const redirectUrl = shouldRedirectToVideo
    ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    : "/";

  const router = useRouter();

  useEffect(() => {
    router.push(redirectUrl);
  }, [router]);
}
