/**
 * This route has been moved to /auth/callback/[provider]/page.tsx
 * to support provider-specific OAuth handling.
 *
 * This file redirects to profile for backwards compatibility.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallbackRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile for backwards compatibility
    router.push("/profile");
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-default-600">Redirecting...</p>
      </div>
    </div>
  );
}
