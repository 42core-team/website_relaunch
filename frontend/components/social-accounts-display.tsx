"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  getSocialAccounts,
  unlinkSocialAccount,
  type SocialAccount,
} from "@/app/actions/social-accounts";
import Link from "next/link";

export default function SocialAccountsDisplay() {
  const { data: session } = useSession();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinkingAccount, setUnlinkingAccount] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadSocialAccounts();
    }
  }, [session]);

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
        return "🎯";
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
                  <span className="text-2xl">
                    {getPlatformIcon(account.platform)}
                  </span>
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
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-medium">42 School</p>
                  <p className="text-sm text-default-500">Not connected</p>
                </div>
              </div>
              <Button
                as={Link}
                href="/link-42"
                size="sm"
                color="primary"
                variant="flat"
              >
                Connect
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
