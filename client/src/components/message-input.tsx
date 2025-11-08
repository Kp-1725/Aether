import { useState } from "react";
import { Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  encrypted?: boolean;
}

export function MessageInput({ onSend, disabled = false, encrypted = true }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4 bg-background">
      <div className="flex items-center gap-2 mb-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={encrypted ? "default" : "secondary"} className="gap-1">
              <Lock className="h-3 w-3" />
              {encrypted ? 'Encrypted' : 'Not Encrypted'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Messages are encrypted with AES-256</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex gap-2">
        <Textarea
          placeholder="Type your message... (Shift+Enter for new line)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="resize-none min-h-[60px]"
          data-testid="input-message"
        />
        <Button 
          onClick={handleSend} 
          disabled={disabled || !message.trim()}
          size="icon"
          className="h-[60px] w-[60px]"
          data-testid="button-send-message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
