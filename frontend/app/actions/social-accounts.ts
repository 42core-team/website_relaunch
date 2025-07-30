"use server";

import axiosInstance from "./axios";

export interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  platformUserId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkSocialAccountData {
  userId: string;
  platform: string;
  username: string;
  platformUserId: string;
}

export async function linkSocialAccount(
  data: LinkSocialAccountData,
): Promise<SocialAccount> {
  try {
    const response = await axiosInstance.post("/social-accounts/link", data);
    return response.data;
  } catch (error: any) {
    console.error("Error linking social account:", error);
    throw new Error(
      error.response?.data?.message || "Failed to link social account",
    );
  }
}

export async function unlinkSocialAccount(
  userId: string,
  platform: string,
): Promise<void> {
  try {
    await axiosInstance.delete(`/social-accounts/${userId}/${platform}`);
  } catch (error: any) {
    console.error("Error unlinking social account:", error);
    throw new Error(
      error.response?.data?.message || "Failed to unlink social account",
    );
  }
}

export async function getSocialAccounts(
  userId: string,
): Promise<SocialAccount[]> {
  try {
    const response = await axiosInstance.get(`/social-accounts/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching social accounts:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch social accounts",
    );
  }
}

export async function getSocialAccountByPlatform(
  userId: string,
  platform: string,
): Promise<SocialAccount | null> {
  try {
    const response = await axiosInstance.get(
      `/social-accounts/${userId}/${platform}`,
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching social account:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch social account",
    );
  }
}
