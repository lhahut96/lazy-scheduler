import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Description } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { DataRow } from "./DataTable";

interface DialogFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRow: DataRow;
  onUpdate: (updatedRow: DataRow) => void; // New prop for update
}

export default function DialogForm({
  isOpen,
  onClose,
  selectedRow,
  onUpdate, // Receive update function
}: DialogFormProps) {
  const [reminderMinutes, setReminderMinutes] = useState(selectedRow.reminders);
  const [reminderType, setReminderType] = useState("minute");
  const [notes, setNotes] = useState(selectedRow.description);

  const handleSave = () => {
    let newReminderMinutes = reminderMinutes;

    // Convert reminder to minutes based on the type
    switch (reminderType) {
      case "hour":
        newReminderMinutes = reminderMinutes * 60; // Convert to minutes
        break;
      case "day":
        newReminderMinutes = reminderMinutes * 60 * 24; // Convert to minutes
        break;
      default:
        break;
    }

    // Call the update function with new data
    onUpdate({
      id: selectedRow.id,
      name: selectedRow.name,
      startTime: selectedRow.startTime,
      endTime: selectedRow.endTime,
      description: notes,
      reminders: newReminderMinutes, // Ensure it's an integer
    });
    onClose(); // Close dialog after saving
  };

  useEffect(() => {
    if (reminderMinutes >= 1440 && reminderMinutes % 1440 === 0) {
      // 1440 minutes = 24 hours
      const days = Math.floor(reminderMinutes / 1440);
      setReminderMinutes(days);
      setReminderType("day");
    } else if (reminderMinutes >= 60 && reminderMinutes % 60 === 0) {
      // Between 1 hour and 24 hours
      const hours = Math.floor(reminderMinutes / 60);
      setReminderMinutes(hours);
      setReminderType("hour");
    } else {
      setReminderType("minute");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px] bg-white text-black'>
        <Description className='hidden'>Edit event</Description>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Edit {selectedRow.name}
          </DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='notes' className='text-black'>
              Notes:
            </Label>
            <Textarea
              id='notes'
              placeholder='Write your notes here...'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='min-h-[100px] text-black'
            />
          </div>
          <div className='grid gap-2'>
            <Label className='text-black'>Reminder:</Label>
            <div className='flex gap-2'>
              <Input
                type='number'
                placeholder='Enter number'
                className='w-24 text-black h-10'
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(parseInt(e.target.value))}
              />
              <Select
                onValueChange={(value) => {
                  setReminderType(value);
                }}
                defaultValue={reminderType}
              >
                <SelectTrigger className='w-[170px] h-10 text-black'>
                  <SelectValue placeholder='Minute(s)' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='minute'>Minute(s)</SelectItem>
                  <SelectItem value='hour'>Hour(s)</SelectItem>
                  <SelectItem value='day'>Day</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSave}
                className='bg-green-500 text-white hover:bg-green-600'
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
