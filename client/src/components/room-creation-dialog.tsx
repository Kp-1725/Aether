import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RoomCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (roomName: string) => void;
}

export function RoomCreationDialog({ 
  open, 
  onOpenChange, 
  onCreate 
}: RoomCreationDialogProps) {
  const [roomName, setRoomName] = useState("");

  const handleCreate = () => {
    if (roomName.trim()) {
      onCreate(roomName);
      setRoomName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-create-room">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>
            Create a new encrypted chat room. You'll need to share the encryption key with participants.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="e.g., Team Chat, Project Alpha"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              data-testid="input-room-name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!roomName.trim()}
            data-testid="button-create-room-submit"
          >
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
