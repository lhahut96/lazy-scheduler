"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { DragEvent, useRef, useState } from "react";

export default function DragUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const saveFile = async (file: File) => {
    const newHandle = await window.showSaveFilePicker();
    const writable = await newHandle.createWritable();
    await writable.write(file);
    await writable.close();
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        console.log(e.target.files[0]);
        saveFile(e.target.files[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = () => {
    // Here you would typically send the files to your server
    console.log("Uploading files:", files);
  };

  return (
    <div className='w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-primary bg-primary/10" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className='mx-auto h-12 w-12 text-gray-400' />
        <Label
          htmlFor='file-upload'
          className='mt-4 block text-sm font-medium text-gray-700'
        >
          Drag and drop your files here, or click to select files
        </Label>
        <Input
          id='file-upload'
          type='file'
          multiple
          className='hidden'
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <Button
          variant='outline'
          className='mt-4'
          onClick={() => fileInputRef.current?.click()}
        >
          Select Files
        </Button>
      </div>
      {files.length > 0 && (
        <div className='mt-4'>
          <h3 className='text-lg font-semibold'>Selected Files:</h3>
          <ul className='mt-2 space-y-1'>
            {files.map((file, index) => (
              <li key={index} className='text-sm text-gray-600'>
                {file.name}
              </li>
            ))}
          </ul>
          <Button className='mt-4 w-full' onClick={handleUpload}>
            Upload Files
          </Button>
        </div>
      )}
    </div>
  );
}
