"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <Label htmlFor='time'>
          Class Time
          </Label>
        <div className='flex-grow'>          
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
