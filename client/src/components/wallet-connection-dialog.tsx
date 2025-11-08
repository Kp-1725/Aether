import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WalletConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: () => void;
  error?: string;
}

export function WalletConnectionDialog({ 
  open, 
  onOpenChange, 
  onConnect,
  error 
}: WalletConnectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-wallet-connection">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Connect your MetaMask wallet to start using the decentralized chat.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You'll need MetaMask installed to use this application. MetaMask provides:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Your blockchain identity</li>
              <li>Secure message verification</li>
              <li>Transaction signing</li>
            </ul>
          </div>
          <Button 
            className="w-full gap-2" 
            onClick={onConnect}
            data-testid="button-connect-metamask"
          >
            <Wallet className="h-4 w-4" />
            Connect MetaMask
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Don't have MetaMask?{" "}
            <a 
              href="https://metamask.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Install it here
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
