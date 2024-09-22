"use client";
import CourseName from "@/components/home/CourseName";
import DataTable, { DataRow } from "@/components/home/DataTable";
import DragUpload from "@/components/home/DragUpload";
import Header from "@/components/home/Header";
import { generateSchedule, generateScheduleData } from "@/lib/axios/fetchApi";
import { useState } from "react";

type ScheduleData = {
  course: string;
  description: string;
  endtime: string;
  events: DataRow[];
}

export default function Home() {
  const [data, setData] = useState<generateScheduleData>({
    courseName: "",
    roomNumber: "",
    time : "12:00",
    outlineFile: null,
  });

  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    course: "",
    description: "",
    endtime: "",
    events: [],
  });

  // const handleScheduleUploadFile = (file: File) => {
  //   setData({ ...data, scheduleFile: file });
  // };
  const handleOutlineUploadFile = (file: File) => {
    setData({ ...data, outlineFile: file });
  };

  const fieldUpdate = (values: { courseName: string; roomNumber: string, time: string}) => {
    const newData = {
      courseName: values.courseName,
      roomNumber: values.roomNumber,
      time: values.time,
      outlineFile: data.outlineFile,
    };
    setData(newData);
    handleGenerateSchedule(newData);
  };

  const handleGenerateSchedule = async (data: generateScheduleData) => {
    try {
      const response = await generateSchedule(data);
      console.log(response);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Header />
      <div className='w-full flex items-center justify-center p-20'>
        <div className='space-y-4 flex flex-col w-full items-center justify-center'>
          <div className='flex'>
            {/* <DragUpload handleUpload={handleScheduleUploadFile} /> */}
            <DragUpload handleUpload={handleOutlineUploadFile} />
          </div>

          <CourseName
            handleFieldUpdate={fieldUpdate}
          />
          <DataTable />
        </div>
      </div>
    </>
  );
}
