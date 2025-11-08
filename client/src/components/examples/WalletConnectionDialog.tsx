import { useState } from 'react';
import { WalletConnectionDialog } from '../wallet-connection-dialog';
import { Button } from '@/components/ui/button';

export default function WalletConnectionDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Wallet Dialog</Button>
      <WalletConnectionDialog
        open={open}
        onOpenChange={setOpen}
        onConnect={() => {
          console.log('Connect wallet');
          setOpen(false);
        }}
      />
    </>
  );
}
