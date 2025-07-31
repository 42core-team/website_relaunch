import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import axiosInstance from "@/app/actions/axios";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, state } = await request.json();

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state" },
        { status: 400 },
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_ID!,
        client_secret: process.env.FORTY_TWO_CLIENT_SECRET!,
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/link-42`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.json(
        { error: "Failed to exchange authorization code" },
        { status: 400 },
      );
    }

    const tokenData = await tokenResponse.json();

    // Get user profile from 42 API
    const profileResponse = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error("Profile fetch failed:", await profileResponse.text());
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 400 },
      );
    }

    const profile = await profileResponse.json();

    // Link the account via backend API
    try {
      const linkResult = await axiosInstance.post("/social-accounts/link", {
        platform: "42",
        username: profile.login,
        platformUserId: profile.id.toString(),
      });

      return NextResponse.json({
        success: true,
        account: linkResult.data,
        profile: {
          login: profile.login,
          displayName: profile.displayname,
          email: profile.email,
        },
      });
    } catch (linkError: any) {
      console.error("Account linking failed:", linkError);
      return NextResponse.json(
        {
          error: linkError.response?.data?.message || "Failed to link account",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("42 linking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
