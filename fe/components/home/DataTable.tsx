import React, { useState } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Define the structure of the data for the table rows
interface DataRow {
  id: number;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  reminders: string;
}

// Props interface to specify that the component expects an array of data
interface TableProps {
  data: DataRow[];
}

const Table: React.FC<TableProps> = ({ data }) => {
  // State to handle the dialog visibility and the selected row
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);

  // Handle settings icon click
  const handleSettingsClick = (row: DataRow) => {
    setSelectedRow(row);
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRow(null);
  };

  return (
    <>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={cellStyle}>EVENT</th>
            <th style={cellStyle}>DATE</th>
            <th style={cellStyle}>TIME</th>
            <th style={cellStyle}>REMINDER</th>
            <th style={cellStyle}>NOTES</th>
            <th style={cellStyle}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} style={rowStyle}>
              <td style={cellStyle}>{row.name}</td>
              <td style={cellStyle}>{row.startTime}</td>
              <td style={cellStyle}>{row.endTime}</td>
              <td style={cellStyle}>{row.reminders}</td>
              <td style={cellStyle}>{row.description}</td>
              <td style={cellStyle}>
                <Settings
                  onClick={() => handleSettingsClick(row)}
                  style={{ cursor: "pointer" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dialog for editing row */}
      {isDialogOpen && selectedRow && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit {selectedRow.name}</DialogTitle>
              <DialogDescription>
                Make changes to the event. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  defaultValue={selectedRow.name}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  defaultValue={selectedRow.description}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCloseDialog}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const cellStyle: React.CSSProperties = {
  border: "1px solid black",
  padding: "8px",
  textAlign: "left",
};

// Adding margin-bottom to rows
const rowStyle: React.CSSProperties = {
  marginBottom: "50px", // Adds spacing between rows
};

// Sample data for the table
const sampleData: DataRow[] = [
  {
    id: 1,
    name: "quiz 1",
    description: "this is description/remarks/notes",
    startTime: "2024-09-21T14:00:00-07:00",
    endTime: "2024-09-21T17:00:00-07:00",
    reminders: "2 days",
  },
  {
    id: 2,
    name: "quiz 2",
    description: "this is description/remarks/notes",
    startTime: "2024-09-22T14:00:00-07:00",
    endTime: "2024-09-22T17:00:00-07:00",
    reminders: "3 days",
  },
];

// Usage of the Table component with the sample data
const App: React.FC = () => {
  return (
    <div>
      <Table data={sampleData} />
    </div>
  );
};

export default App;
