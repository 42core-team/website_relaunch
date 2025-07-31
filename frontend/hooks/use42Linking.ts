import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

interface Use42LinkingReturn {
  isLinking: boolean;
  isInitiating: boolean;
  error: string | null;
  initiate42OAuth: () => void;
  clearState: () => void;
}

export function use42Linking(onSuccess?: () => void): Use42LinkingReturn {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [isLinking, setIsLinking] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef<string | null>(null);

  const clearState = useCallback(() => {
    setError(null);
    setIsLinking(false);
    setIsInitiating(false);
    processingRef.current = null;
    // Clean up all OAuth-related session storage
    sessionStorage.removeItem("oauth_state");
    sessionStorage.removeItem("processed_oauth_code");
  }, []);

  const initiate42OAuth = useCallback(() => {
    // Clear any previous errors and show immediate loading feedback
    setError(null);
    setIsInitiating(true);

    // Small delay to show the loading state before redirect
    setTimeout(() => {
      const state = Math.random().toString(36).substring(7);
      const authUrl = new URL("https://api.intra.42.fr/oauth/authorize");

      authUrl.searchParams.set(
        "client_id",
        process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_ID!,
      );
      authUrl.searchParams.set(
        "redirect_uri",
        `${window.location.origin}/profile`,
      );
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "public");
      authUrl.searchParams.set("state", state);

      // Store state in sessionStorage for verification
      sessionStorage.setItem("oauth_state", state);

      window.location.href = authUrl.toString();
    }, 100); // Brief delay to show loading state
  }, []);

  const handleLink42Account = useCallback(
    async (code: string, state: string) => {
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

        // Success! Clear any previous errors and trigger callback
        setError(null);
        onSuccess?.();

        // Clear URL parameters and session storage
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState({}, "", url.toString());
        sessionStorage.removeItem("processed_oauth_code");
        processingRef.current = null;
      } catch (err: any) {
        console.error("Error linking 42 account:", err);
        setError(err.message || "Failed to link 42 account");
        // Clean up session storage and processing ref on error
        sessionStorage.removeItem("processed_oauth_code");
        processingRef.current = null;
      } finally {
        setIsLinking(false);
      }
    },
    [session?.user?.id, onSuccess],
  );

  // Handle OAuth callback
  useEffect(() => {
    if (!session?.user?.id) return;

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      // Check if we're already processing this code (using ref to avoid re-renders)
      if (processingRef.current === code) {
        return; // Already processing this code
      }

      // Also check sessionStorage as backup
      const processedCode = sessionStorage.getItem("processed_oauth_code");
      if (processedCode === code) {
        return; // Already processed this code
      }

      const storedState = sessionStorage.getItem("oauth_state");
      sessionStorage.removeItem("oauth_state");

      // Mark as processing immediately
      processingRef.current = code;

      // Clear any previous errors before processing
      setError(null);

      // Verify state matches what we stored
      if (storedState === state) {
        // Mark this code as being processed in sessionStorage
        sessionStorage.setItem("processed_oauth_code", code);
        handleLink42Account(code, state);
      } else {
        setError("Invalid OAuth state. Please try again.");
        processingRef.current = null; // Reset processing ref on error
      }
    }
  }, [session?.user?.id, searchParams]);

  return {
    isLinking,
    isInitiating,
    error,
    initiate42OAuth,
    clearState,
  };
}
