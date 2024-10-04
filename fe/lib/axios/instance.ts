import axios from "axios";
import { redirect } from "next/navigation";


const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Replace with your API base URL
  timeout: 60000, // Request timeout in milliseconds
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error);
    if ([301, 302].includes(error.response.status)) {
      const redirectUrl = error.response.headers.location;
      return redirect(redirectUrl);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
