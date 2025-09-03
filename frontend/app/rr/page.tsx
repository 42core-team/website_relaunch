"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const metadata = {
  title: "Never Gonna Give You Up",
  description: "You've been rickrolled!",
};

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
