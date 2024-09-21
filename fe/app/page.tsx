"use client";
import CourseName from "@/components/home/CourseName";
import DragUpload from "@/components/home/DragUpload";
import Header from "@/components/home/Header";

export default function Home() {
  return (
    <>
      <Header />
      <div className='w-full flex items-center justify-center p-20'>
        <div className="">
          <DragUpload />  
          <CourseName />
        </div>
      </div>
    </>
  );
}
