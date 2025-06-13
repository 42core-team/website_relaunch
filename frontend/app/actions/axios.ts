import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `${process.env.BACKEND_SECRET}`,
  },
});

export default axiosInstance;
