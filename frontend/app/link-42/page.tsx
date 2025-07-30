"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/react";

function Link42Content() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    // Check if we have the authorization code from 42
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      handleLink42Account(code, state);
    }
  }, [session, status, searchParams]);

  const handleLink42Account = async (code: string, state: string) => {
    if (!session?.user?.id) return;

    setIsLinking(true);
    setError(null);

    try {
      // Call our API route to handle the OAuth exchange and account linking
      const response = await fetch("/api/auth/42-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          state: state,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to link 42 account");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/profile"); // Redirect to profile page
      }, 2000);
    } catch (err: any) {
      console.error("Error linking 42 account:", err);
      setError(err.message || "Failed to link 42 account");
    } finally {
      setIsLinking(false);
    }
  };

  const initiate42OAuth = () => {
    const state = Math.random().toString(36).substring(7);
    const authUrl = new URL("https://api.intra.42.fr/oauth/authorize");

    authUrl.searchParams.set(
      "client_id",
      process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_ID!,
    );
    authUrl.searchParams.set(
      "redirect_uri",
      `${window.location.origin}/link-42`,
    );
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "public");
    authUrl.searchParams.set("state", state);

    // Store state in sessionStorage for verification
    sessionStorage.setItem("oauth_state", state);

    window.location.href = authUrl.toString();
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in first</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <h1 className="text-2xl font-bold">Link 42 Account</h1>
        </CardHeader>
        <CardBody className="space-y-4">
          {!searchParams.get("code") && !success && (
            <>
              <p className="text-gray-600">
                Link your 42 School account to your profile to display your 42
                username.
              </p>
              <Button
                color="primary"
                onPress={initiate42OAuth}
                className="w-full"
              >
                Connect 42 Account
              </Button>
            </>
          )}

          {isLinking && (
            <div className="text-center">
              <p>Linking your 42 account...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Successfully linked your 42 account! Redirecting...
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function Link42Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Link42Content />
    </Suspense>
  );
}
