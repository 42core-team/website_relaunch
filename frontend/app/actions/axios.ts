import axios from "axios";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";

const axiosInstance = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `${process.env.BACKEND_SECRET}`,
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getServerSession(authOptions);
    config.headers.userId = session?.user?.id || "";
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  },
);

export default axiosInstance;
