"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button, Chip } from "@heroui/react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import Image from "next/image";
import {
  getSocialAccounts,
  unlinkSocialAccount,
  type SocialAccount,
} from "@/app/actions/social-accounts";
import { use42Linking } from "@/hooks/use42Linking";

export default function SocialAccountsDisplay() {
  const { data: session } = useSession();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinkingAccount, setUnlinkingAccount] = useState<string | null>(null);

  const { error, isInitiating, initiate42OAuth, clearState } = use42Linking(
    () => {
      loadSocialAccounts(); // Refresh the accounts list on successful linking
    },
  );

  useEffect(() => {
    if (session?.user?.id) {
      loadSocialAccounts();
    }
  }, [session]);

  // Clear any lingering errors when the component mounts or when we detect a new 42 account
  useEffect(() => {
    const has42Account = socialAccounts.some(
      (account) => account.platform === "42",
    );
    if (has42Account && error) {
      clearState(); // Clear error if we now have a 42 account (successful link)
    }
  }, [socialAccounts, error, clearState]);

  const loadSocialAccounts = async () => {
    if (!session?.user?.id) return;

    try {
      const accounts = await getSocialAccounts();
      setSocialAccounts(accounts);
    } catch (error) {
      console.error("Error loading social accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (platform: string) => {
    if (
      !session?.user?.id ||
      !confirm("Are you sure you want to unlink this account?")
    )
      return;

    setUnlinkingAccount(platform);
    try {
      await unlinkSocialAccount(platform);
      setSocialAccounts((accounts) =>
        accounts.filter((account) => account.platform !== platform),
      );
    } catch (error) {
      console.error("Error unlinking account:", error);
      alert("Failed to unlink account. Please try again.");
    } finally {
      setUnlinkingAccount(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "github":
        return "🐙";
      case "42":
        return (
          <Image
            src="/42-logo.svg"
            alt="42 School"
            width={24}
            height={24}
            className="w-6 h-6 invert dark:invert-0"
          />
        );
      case "discord":
        return "💬";
      case "twitter":
        return "🐦";
      case "linkedin":
        return "💼";
      default:
        return "🔗";
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case "42":
        return "42 School";
      case "github":
        return "GitHub";
      case "discord":
        return "Discord";
      case "twitter":
        return "Twitter";
      case "linkedin":
        return "LinkedIn";
      default:
        return platform;
    }
  };

  const get42Account = () =>
    socialAccounts.find((account) => account.platform === "42");

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[100px]">
        <div className="text-default-500">Loading social accounts...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Linked Accounts</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        {socialAccounts.length === 0 ? (
          <p className="text-default-600">No social accounts linked yet.</p>
        ) : (
          <div className="space-y-3">
            {socialAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 border border-default-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl flex items-center justify-center w-8 h-8">
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {getPlatformName(account.platform)}
                    </p>
                    <p className="text-sm text-default-500">
                      @{account.username}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  onPress={() => handleUnlink(account.platform)}
                  isLoading={unlinkingAccount === account.platform}
                >
                  Unlink
                </Button>
              </div>
            ))}
          </div>
        )}

        {!get42Account() && (
          <div className="border-t border-default-200 pt-4">
            <div className="flex items-center justify-between p-3 border border-default-200 rounded-lg border-dashed">
              <div className="flex items-center space-x-3">
                <div className="text-2xl flex items-center justify-center w-8 h-8">
                  <Image
                    src="/42-logo.svg"
                    alt="42 School"
                    width={24}
                    height={24}
                    className="w-6 h-6 invert dark:invert-0"
                  />
                </div>
                <div>
                  <p className="font-medium">42 School</p>
                  <p className="text-sm text-default-500">Not connected</p>
                </div>
              </div>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={initiate42OAuth}
                isLoading={isInitiating}
                spinner={
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                }
              >
                {isInitiating ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-danger text-lg flex-shrink-0 mt-0.5">
                ⚠️
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-danger">
                  Failed to connect 42 account
                </p>
                <p className="text-xs text-danger-600 mt-1">{error}</p>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={initiate42OAuth}
                  className="mt-2 h-7"
                >
                  Try Again
                </Button>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={clearState}
                className="min-w-0 w-6 h-6 flex-shrink-0"
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
