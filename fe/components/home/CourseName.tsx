"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import TimePicker from "../TimePicker";

export default function CourseName({
  handleFieldUpdate,
}: {
  handleFieldUpdate: (values: {
    courseName: string;
    roomNumber: string;
    time: string;
  }) => void,
}) {
  const [time, setTime] = useState("12:00");

  const formSchema = z.object({
    courseName: z.string().min(2).max(50),
    roomNumber: z.string().min(2).max(50),
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: "",
      roomNumber: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    handleFieldUpdate({...values, time});
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8 max-w-[300px] flex flex-col items-center'
      >
        <FormField
          control={form.control}
          name='courseName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name: </FormLabel>
              <FormControl>
                <Input placeholder='Course Name: CSIS-3375' {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='roomNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number:</FormLabel>
              <FormControl>
                <Input placeholder='Room Number: NW6170' {...field} />
              </FormControl>
            </FormItem>
          )}
        />
          <TimePicker setTimeData={setTime} />

        <Button className='mx-auto' type='submit'>
          Generate Schedule
        </Button>
      </form>
    </Form>
  );
}
