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
import { useEffect, useState } from "react";
import DialogForm from "./DialogForm";

export type DataRow = {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  reminders: number[];
};

const initialData : DataRow[] = [
  {
    name: "quiz 1",
    description: "this is description/remarks/notes",
    startTime: "2024-09-21T14:00:00-07:00",
    endTime: "2024-09-21T17:00:00-07:00",
    reminders: [],
  },
  {
    name: "quiz 2",
    description: "this is description/remarks/notes",
    startTime: "2024-09-22T14:00:00-07:00",
    endTime: "2024-09-22T17:00:00-07:00",
    reminders: [],
  },
];

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
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
  } else if (minutes >= 60) {
    // 60 minutes = 1 hour
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr${hours !== 1 ? "s" : ""}${remainingMinutes > 0 ? ` ${remainingMinutes} min${remainingMinutes !== 1 ? "s" : ""}` : ""}`;
  } else {
    // Less than 1 hour
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  }
};

export default function DataTable({tableData = initialData, handleUpdateTable}: {tableData?: DataRow[], handleUpdateTable: (updatedData: DataRow[]) => void}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [data, setData] = useState(tableData);
  const [selectedRow, setSelectedRow] = useState<DataRow>({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    reminders: [],
  }); // Store selected row for editing

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSettingsClick = (row: DataRow) => {
    setSelectedRow(row);
    setIsDialogOpen(true);
  };

  const handleUpdateRow = (updatedRow: DataRow) => {
    // Update the row in the data array
    const updatedData = data.map((d) => {
      if (d.name === updatedRow.name) {
        return {...updatedRow, reminders: updatedRow.reminders ?? []};
      }
      return d;
    });
    handleUpdateTable(updatedData);
  };

  useEffect(() => {
    setData(tableData);
  }, [tableData]);

  return (
    <>
      <Table>
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className='max-w-1/2 w-fit'>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Reminder</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((d,index) => (
            <TableRow key={index}>
              <TableCell className='font-medium'>{d.name}</TableCell>
              <TableCell>{formatDate(d.startTime)}</TableCell>
              <TableCell>{formatTime(d.startTime)}</TableCell>
              <TableCell>{formatReminder(d.reminders[0] ?? 0)}</TableCell>
              <TableCell>{d.description}</TableCell>
              <TableCell className="flex items-center justify-center">
                <Settings
                  onClick={() => handleSettingsClick(d)}
                  className='cursor-pointer'
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
    </>
  );
}
