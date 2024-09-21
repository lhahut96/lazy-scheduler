import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function DialogForm() {
  const [reminderMinutes, setReminderMinutes] = useState("")
  const [notes, setNotes] = useState("")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Quiz</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Quiz 1</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes:</Label>
            <Textarea
              id="notes"
              placeholder="Write your notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="grid gap-2">
            <Label>Reminder:</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter number"
                className="w-24"
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(e.target.value)}
              />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Minute(s)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minute">Minute(s)</SelectItem>
                  <SelectItem value="hour">Hour(s)</SelectItem>
                </SelectContent>
              </Select>
              <Button>Save</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}