import { useState } from "react";
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
  onUpdate: (updatedRow: { name: string; description: string; reminders: string }) => void; // New prop for update
}

export default function DialogForm({
  isOpen,
  onClose,
  selectedRow,
  onUpdate, // Receive update function
}: DialogFormProps) {
  const [reminderMinutes, setReminderMinutes] = useState(selectedRow.reminders);
  const [notes, setNotes] = useState(selectedRow.description);

  const handleSave = () => {
    // Call the update function with new data
    onUpdate({
      name: selectedRow.name,
      description: notes,
      reminders: parseInt(reminderMinutes), // Ensure it's an integer
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
              <Select>
                <SelectTrigger className="w-[170px] h-10 text-black">
                  <SelectValue placeholder="Minute(s)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minute">Minute(s)</SelectItem>
                  <SelectItem value="hour">Hour(s)</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
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
