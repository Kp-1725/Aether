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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KeyManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKey: string | null;
  onSetKey: (key: string) => void;
}

export function KeyManagementDialog({ 
  open, 
  onOpenChange, 
  currentKey,
  onSetKey 
}: KeyManagementDialogProps) {
  const [newKey, setNewKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSetKey = () => {
    if (newKey.trim()) {
      onSetKey(newKey);
      setNewKey("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-key-management">
        <DialogHeader>
          <DialogTitle>Encryption Key Management</DialogTitle>
          <DialogDescription>
            Set or update the shared secret key for encrypting messages. Share this key securely with room participants.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {currentKey && (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                A key is currently set for this room.
              </AlertDescription>
            </Alert>
          )}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Never share your encryption key over insecure channels. Use a secure method like in-person or encrypted messaging.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="encryption-key">Secret Key</Label>
            <div className="relative">
              <Input
                id="encryption-key"
                type={showKey ? "text" : "password"}
                placeholder="Enter a strong secret key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="pr-10"
                data-testid="input-encryption-key"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use a strong, random key. All participants must use the same key.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSetKey} 
            disabled={!newKey.trim()}
            data-testid="button-set-key"
          >
            Set Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
