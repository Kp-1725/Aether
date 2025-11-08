import { useState } from 'react';
import { RoomCreationDialog } from '../room-creation-dialog';
import { Button } from '@/components/ui/button';

export default function RoomCreationDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Create Room Dialog</Button>
      <RoomCreationDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={(name) => {
          console.log('Creating room:', name);
          setOpen(false);
        }}
      />
    </>
  );
}
