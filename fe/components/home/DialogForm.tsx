import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DialogFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRow: { name: string; description: string; reminders: string };
  onUpdate: (updatedRow: { name: string; description: string; reminders: string }) => void;
}

export default function DialogForm({
  isOpen,
  onClose,
  selectedRow,
  onUpdate,
}: DialogFormProps) {
  const [reminderMinutes, setReminderMinutes] = useState("0"); // Initial default
  const [notes, setNotes] = useState(selectedRow.description);
  const [timeUnit, setTimeUnit] = useState("minute"); // New state for time unit

  // Effect to update state when dialog opens based on selectedRow.reminders
  useEffect(() => {
    const reminderValue = parseInt(selectedRow.reminders, 10);

    if (reminderValue >= 1440) {
      // If it's a day, set unit to day
      setTimeUnit("day");
      setReminderMinutes((reminderValue / 1440).toString()); // Convert minutes to days
    } else if (reminderValue >= 60) {
      // If it's an hour, set unit to hour
      setTimeUnit("hour");
      setReminderMinutes((reminderValue / 60).toString()); // Convert minutes to hours
    } else {
      // Otherwise, it's minutes
      setTimeUnit("minute");
      setReminderMinutes(reminderValue.toString()); // Keep it as minutes
    }

    setNotes(selectedRow.description); // Set notes value
  }, [selectedRow, isOpen]); // Trigger when selectedRow or dialog state changes

  const handleSave = () => {
    let reminderInMinutes = parseInt(reminderMinutes, 10);

    // Convert based on the selected time unit
    if (timeUnit === "hour") {
      reminderInMinutes *= 60; // Convert hours to minutes
    } else if (timeUnit === "day") {
      reminderInMinutes *= 1440; // Convert days to minutes (24 * 60)
    }

    // Call the update function with the converted value
    onUpdate({
      name: selectedRow.name,
      description: notes,
      reminders: reminderInMinutes.toString(), // Save reminders in minutes
    });
    onClose(); // Close dialog after saving
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit {selectedRow.name}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="notes" className="text-black">
              Notes:
            </Label>
            <Textarea
              id="notes"
              placeholder="Write your notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] text-black"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-black">Reminder:</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter number"
                className="w-24 text-black h-10"
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(e.target.value)}
              />
              <Select value={timeUnit} onValueChange={setTimeUnit}> {/* Update selected time unit */}
                <SelectTrigger className="w-[170px] h-10 text-black">
                  <SelectValue placeholder="Minute(s)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minute">Minute(s)</SelectItem>
                  <SelectItem value="hour">Hour(s)</SelectItem>
                  <SelectItem value="day">Day(s)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSave} className="bg-green-500 text-white hover:bg-green-600">
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
