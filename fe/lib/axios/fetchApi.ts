import axiosInstance from "./instance";

export type generateScheduleData = {
  courseName: string;
  roomNumber: string;
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


export {
  generateSchedule
};

