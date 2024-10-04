"use client";
import DataTable, { DataRow } from "@/components/home/DataTable";
import DragUpload from "@/components/home/DragUpload";
import Header from "@/components/home/Header";
import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  clearSchedule,
  createReminders,
  generateSchedule,
  generateScheduleData,
} from "@/lib/axios/fetchApi";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
export type ScheduleData = {
  course: string;
  description: string;
  endtime: string;
  events: DataRow[];
  token?: string;
};

export default function Home() {
  const [finishCreatedReminder, setFinishCreatedReminder] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const session = useSession();

  const [data, setData] = useState<generateScheduleData>({
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

  const handleGenerateSchedule = async () => {
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
      const response = await createReminders({
        ...scheduleData,
        token: session.data?.accessToken,
      });
      setCalendarUrl(response.link);
      setFinishCreatedReminder(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollTo(0, document.body.scrollHeight);
      }, 300);
    }
  };

  const handleClearSchedule = async () => {
    try {
      if (session.data?.accessToken) {
        const response = await clearSchedule(session?.data?.accessToken);
        console.log(response);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLoggin = () => {
    signIn("google");
  };

  useEffect(() => {
    if (scheduleData?.events) {
      setTableData(scheduleData.events);
    }
  }, [scheduleData]);

  useEffect(() => {
    if (session.data?.accessToken) {
      setIsLoggedIn(true);
    }
  }, [session]);

  return (
    <>
      <Header />
      {isLoggedIn ? (
        <div className='w-full flex items-center justify-center p-20'>
          <div className='space-y-4 flex flex-col w-full items-center justify-center'>
            <Button onClick={handleClearSchedule}>Clear Schedule</Button>

            <div className='flex'>
              {/* <DragUpload handleUpload={handleScheduleUploadFile} /> */}
              <DragUpload handleUpload={handleOutlineUploadFile} />
            </div>
            <Button onClick={handleGenerateSchedule}>Generate Schedule</Button>

            {tableData.length ? (
              <>
                {" "}
                <DataTable
                  tableData={tableData}
                  handleUpdateTable={handleUpdateEvents}
                />
                <Button onClick={handleGenerateReminders}>
                  Create Event Reminders
                </Button>
              </>
            ) : (
              <>
                <LoadingSpinner isLoading={isLoading} />
              </>
            )}
          </div>
        </div>
      ) : (
        <div className='w-full flex items-center justify-center'>
          <Button onClick={handleLoggin}>Sign in with Google</Button>
        </div>
      )}
      {finishCreatedReminder ? (
        <div className='w-full space-y-6 flex flex-col items-center justify-center'>
          <h1 className='text-2xl font-semibold text-gray-700 mt-4'>
            Events are created on Google Calendar
          </h1>
          <h1 className='text-2xl font-semibold text-gray-700 mt-4'>
            Pet the dog to navigate to calendar
          </h1>
          <Link href={calendarUrl} target='_blank'>
            <Image src='/dog.gif' width={500} height={500} alt='Dog Gif' />
          </Link>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
