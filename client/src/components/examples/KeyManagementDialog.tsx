import { useState } from 'react';
import { KeyManagementDialog } from '../key-management-dialog';
import { Button } from '@/components/ui/button';

export default function KeyManagementDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Key Management Dialog</Button>
      <KeyManagementDialog
        open={open}
        onOpenChange={setOpen}
        currentKey="existing-key-123"
        onSetKey={(key) => {
          console.log('Setting key:', key);
          setOpen(false);
        }}
      />
    </>
  );
}
