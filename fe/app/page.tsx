"use client";
import CourseName from "@/components/home/CourseName";
import DataTable, { DataRow } from "@/components/home/DataTable";
import DragUpload from "@/components/home/DragUpload";
import Header from "@/components/home/Header";
import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  createReminders,
  generateSchedule,
  generateScheduleData,
} from "@/lib/axios/fetchApi";
import Image from "next/image";
import { useEffect, useState } from "react";

export type ScheduleData = {
  course: string;
  description: string;
  endtime: string;
  events: DataRow[];
};

export default function Home() {
  const [finishCreatedReminder, setFinishCreatedReminder] = useState(false);

  const [data, setData] = useState<generateScheduleData>({
    courseName: "",
    roomNumber: "",
    time: "12:00",
    outlineFile: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const [tableData, setTableData] = useState<DataRow[]>([]);

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

  const fieldUpdate = (values: {
    courseName: string;
    roomNumber: string;
    time: string;
  }) => {
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
      setIsLoading(true);
      const response = await generateSchedule(data);
      setScheduleData(response);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvents = (events: DataRow[]) => {
    setTableData(events);
    setScheduleData({ ...scheduleData, events });
  };

  const handleGenerateReminders = async () => {
    try {
      setIsLoading(true);
      setTableData([]);
      const response = await createReminders(scheduleData);
      setFinishCreatedReminder(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollTo(0, document.body.scrollHeight);
      }, 300)
    }
  };

  useEffect(() => {
    setTableData(scheduleData.events);
  }, [scheduleData]);

  return (
    <>
      <Header />
      <div className='w-full flex items-center justify-center p-20'>
        <div className='space-y-4 flex flex-col w-full items-center justify-center'>
          <div className='flex'>
            {/* <DragUpload handleUpload={handleScheduleUploadFile} /> */}
            <DragUpload handleUpload={handleOutlineUploadFile} />
          </div>

          <CourseName handleFieldUpdate={fieldUpdate} />
          {tableData.length ? (
            <>
              {" "}
              <DataTable
                tableData={tableData}
                handleUpdateTable={handleUpdateEvents}
              />
              <Button onClick={handleGenerateReminders}>Create Event Reminders</Button>
            </>
          ) : (
            <>
              <LoadingSpinner isLoading={isLoading} />
            </>
          )}
        </div>
      </div>
      {finishCreatedReminder ? (
        <div className='w-full flex items-center justify-center'>
          <Image src='/dog.gif' width={500} height={500} alt='Dog Gif' />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
