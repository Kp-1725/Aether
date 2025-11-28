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
import {
  FileAttachmentButton,
  FilePreview,
  type FileAttachment,
} from "@/components/file-attachment";

interface MessageInputProps {
  onSend: (message: string, file?: FileAttachment) => void;
  disabled?: boolean;
  encrypted?: boolean;
}

export function MessageInput({
  onSend,
  disabled = false,
  encrypted = true,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<FileAttachment | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() || attachedFile) {
      onSend(message, attachedFile || undefined);
      setMessage("");
      setAttachedFile(null);
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
    textareaRef.current?.focus();
  };

  const handleFileSelect = (file: FileAttachment) => {
    setAttachedFile(file);
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

      {/* File Preview */}
      {attachedFile && (
        <div className="mb-3">
          <FilePreview
            file={attachedFile}
            onRemove={() => setAttachedFile(null)}
            isCompact
          />
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1 flex gap-2 items-end">
          <FileAttachmentButton
            onFileSelect={handleFileSelect}
            disabled={disabled}
          />
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
          disabled={disabled || (!message.trim() && !attachedFile)}
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
