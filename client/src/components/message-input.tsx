import { useState, useRef } from "react";
import { Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmojiPicker } from "@/components/emoji-picker";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  encrypted?: boolean;
}

export function MessageInput({
  onSend,
  disabled = false,
  encrypted = true,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    // Focus back on textarea after emoji selection
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t p-4 bg-background">
      <div className="flex items-center gap-2 mb-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={encrypted ? "default" : "secondary"}
              className="gap-1"
            >
              <Lock className="h-3 w-3" />
              {encrypted ? "Encrypted" : "Not Encrypted"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Messages are encrypted with AES-256</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1 flex gap-2 items-end">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <Textarea
            ref={textareaRef}
            placeholder="Type your message... (Shift+Enter for new line)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="resize-none min-h-[60px] flex-1"
            data-testid="input-message"
          />
        </div>
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
