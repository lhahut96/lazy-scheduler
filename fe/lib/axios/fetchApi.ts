import { ScheduleData } from "@/app/page";
import axiosInstance from "./instance";

export type generateScheduleData = {
  courseName: string;
  roomNumber: string;
  time: string;
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

const createReminders = async (data: ScheduleData) => {
  try {
    const response = await axiosInstance.post("/create-schedule", data);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
}


export {
  createReminders, generateSchedule
};

