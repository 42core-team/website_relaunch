"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import SocialAccountsDisplay from "@/components/social-accounts-display";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-600">
            Manage your account and linked social platforms
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center space-x-4">
            <img
              src={session.user?.image || "/placeholder-avatar.png"}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold">{session.user?.name}</h2>
              <p className="text-gray-600">{session.user?.email}</p>
            </div>
          </div>
        </div>

        <SocialAccountsDisplay />
      </div>
    </div>
  );
}
