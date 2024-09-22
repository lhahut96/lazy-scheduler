"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function TimePicker({
  setTimeData,
}: {
  setTimeData: (time: string) => void;
}) {
  const [time, setTime] = useState("12:00");

  useEffect(() => {
    setTimeData(time);
  }, [time, setTimeData]);

  return (
    <div className='w-fit space-y-4'>
      <div className='flex items-center space-x-4'>
        <Clock className='h-5 w-5 text-gray-500' />
        <div className='flex-grow'>
          <Label htmlFor='time' className='sr-only'>
            Time
          </Label>
          <Input
            id='time'
            type='time'
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className='w-fit'
          />
        </div>
      </div>
    </div>
  );
}
