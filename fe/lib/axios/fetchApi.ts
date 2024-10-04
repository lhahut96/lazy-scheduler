import { ScheduleData } from "@/app/page";
import axiosInstance from "./instance";

export type generateScheduleData = {
  outlineFile: File | null;
};

const generateSchedule = async (data: generateScheduleData) => {
  try {
    const response = await axiosInstance.postForm("/upload", data);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
};

const clearSchedule = async (token: string) => {
  try {
    const response = await axiosInstance.post("/clear-schedule", { token });
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
};

const createReminders = async (data: ScheduleData) => {
  try {
    const response = await axiosInstance.post("/create-schedule", data);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
};

export { clearSchedule, createReminders, generateSchedule };

