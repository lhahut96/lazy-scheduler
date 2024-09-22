"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Archive, File, FileQuestion, FileText, Film, Image, Music, Upload } from "lucide-react";
import { DragEvent, useEffect, useRef, useState } from "react";

export default function DragUpload({
  handleUpload,
}: {
  handleUpload: (file: File) => void;
}) {
  const [file, setFile] = useState<File>();
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
      setFile(Array.from(e.dataTransfer.files)[0]);
      if (file) {
        handleUpload(file);
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-12 w-12" />
    if (fileType.startsWith('video/')) return <Film className="h-12 w-12" />
    if (fileType.startsWith('audio/')) return <Music className="h-12 w-12" />
    if (fileType === 'application/pdf') return <FileText className="h-12 w-12" />
    if (fileType === 'application/zip' || fileType === 'application/x-rar-compressed') return <Archive className="h-12 w-12" />
    if (fileType.startsWith('text/')) return <File className="h-12 w-12" />
    return <FileQuestion className="h-12 w-12" />
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        setFile(e.target.files[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (file) {
      handleUpload(file);
    }
  }, [file]);

  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-primary bg-primary/10" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex flex-col items-center">
            {getFileIcon(file.type)}
            <span className="mt-2 text-sm font-medium text-gray-700 max-w-[200px] truncate">{file.name}</span>
            <span className="mt-2 text-sm font-medium text-gray-700">{file.type}</span>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <Label htmlFor="file-upload" className="mt-4 block text-sm font-medium text-gray-700">
              Drag and drop your file here, or click to select a file
            </Label>
          </>
        )}
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
    </div>
  );
}
