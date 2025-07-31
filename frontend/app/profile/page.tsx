"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader, Avatar, User } from "@heroui/react";
import { title } from "@/components/primitives";
import SocialAccountsDisplay from "@/components/social-accounts-display";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-default-500">Loading...</div>
      </div>
    );
  }

  if (!session) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className={title()}>Profile</h1>
          <p className="mt-4 text-lg text-default-600">
            Manage your account and linked social platforms
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Account Information</h2>
          </CardHeader>
          <CardBody>
            <User
              name={session.user?.name}
              description={session.user?.email}
              avatarProps={{
                src: session.user?.image || "/placeholder-avatar.png",
                size: "lg",
                isBordered: true,
              }}
              className="justify-start"
            />
          </CardBody>
        </Card>

        <SocialAccountsDisplay />
      </div>
    </div>
  );
}
