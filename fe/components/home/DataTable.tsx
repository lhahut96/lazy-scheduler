import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings } from "lucide-react";
import DialogForm from "./DialogForm";
import { Button } from "@/components/ui/button";

const initialData = [
  {
    id: 1,
    name: "quiz 1",
    description: "this is description/remarks/notes",
    startTime: "2024-09-21T14:00:00-07:00",
    endTime: "2024-09-21T17:00:00-07:00",
    reminders: 180,
  },
  {
    id: 2,
    name: "quiz 2",
    description: "this is description/remarks/notes",
    startTime: "2024-09-22T14:00:00-07:00",
    endTime: "2024-09-22T17:00:00-07:00",
    reminders: 1440,
  },
];

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0"); // Ensures two digits
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Converts to 12-hour format
  return `${hours}:${minutes}${period}`;
};

// Helper function to format reminders from minutes to "X hours Y minutes"
const formatReminder = (minutes: number): string => {
  if (minutes >= 1440) {
    // 1440 minutes = 24 hours
    const days = Math.floor(minutes / 1440);
    return `${days} day${days !== 1 ? "s" : ""}`;
  } else if (minutes < 60) {
    // Less than 1 hour
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  } else {
    // Between 1 hour and 24 hours
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr${hours !== 1 ? "s" : ""} ${remainingMinutes} min${
      remainingMinutes !== 1 ? "s" : ""
    }`;
  }
};

export default function DataTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [data, setData] = useState(initialData);
  const [selectedRow, setSelectedRow] = useState(null); // Store selected row for editing

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSettingsClick = (row) => {
    setSelectedRow(row);
    setIsDialogOpen(true);
  };

  const handleUpdateRow = (updatedRow) => {
    // Update the row in the data array
    setData((prevData) =>
      prevData.map((d) =>
        d.name === updatedRow.name ? { ...d, ...updatedRow } : d
      )
    );
  };

  return (
    <>
      <Table>
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Reminder</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Settings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-medium">{d.name}</TableCell>
              <TableCell>{formatDate(d.startTime)}</TableCell>
              <TableCell>{formatTime(d.endTime)}</TableCell>
              <TableCell>{formatReminder(d.reminders)}</TableCell>
              <TableCell>{d.description}</TableCell>
              <TableCell>
                <Settings
                  onClick={() => handleSettingsClick(d)}
                  className="cursor-pointer"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isDialogOpen && selectedRow && (
        <DialogForm
          isOpen={isDialogOpen}
          selectedRow={selectedRow}
          onClose={closeDialog}
          onUpdate={handleUpdateRow} // Pass update function
        />
      )}

      <div className="flex justify-center">
        <Button type="submit" className="w-full max-w-32">
          Confirm
        </Button>
      </div>
    </>
  );
}
