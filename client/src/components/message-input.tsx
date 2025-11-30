import { useState, useRef } from "react";
import { Send, Lock, LockOpen, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (message: string, file?: FileAttachment) => void;
  disabled?: boolean;
  encrypted?: boolean;
  onEncryptingChange?: (isEncrypting: boolean) => void;
}

export function MessageInput({
  onSend,
  disabled = false,
  encrypted = true,
  onEncryptingChange,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<FileAttachment | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (message.trim() || attachedFile) {
      // Show encryption animation
      if (encrypted) {
        setIsEncrypting(true);
        onEncryptingChange?.(true);

        // Small delay to show animation
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      onSend(message, attachedFile || undefined);
      setMessage("");
      setAttachedFile(null);

      // Hide encryption animation
      setTimeout(() => {
        setIsEncrypting(false);
        onEncryptingChange?.(false);
      }, 200);
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
    <div className="border-t p-4 bg-background relative overflow-hidden">
      {/* Encryption Status Bar */}
      <div className="flex items-center gap-2 mb-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 cursor-default",
                encrypted
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                  : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20"
              )}
            >
              {encrypted ? (
                <>
                  <Shield className="h-3 w-3" />
                  <Lock className="h-3 w-3" />
                  <span>AES-256 Encrypted</span>
                </>
              ) : (
                <>
                  <LockOpen className="h-3 w-3" />
                  <span>Not Encrypted</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              {encrypted ? (
                <>
                  <p className="font-semibold flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    End-to-End Encrypted
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Messages are encrypted with AES-256 before being sent over
                    the P2P network. Only users with the shared key can decrypt
                    them.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-yellow-500">
                    No Encryption Key Set
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Set an encryption key to enable secure messaging.
                  </p>
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Encrypting Indicator */}
        {isEncrypting && (
          <div className="flex items-center gap-1.5 text-xs text-primary animate-pulse">
            <Key className="h-3 w-3 animate-spin" />
            <span>Encrypting...</span>
          </div>
        )}
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
        <div className="flex-1 flex gap-1 sm:gap-2 items-end">
          <FileAttachmentButton
            onFileSelect={handleFileSelect}
            disabled={disabled || isEncrypting}
          />
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <Textarea
            ref={textareaRef}
            placeholder={
              encrypted ? "Type a secure message..." : "Type a message..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isEncrypting}
            className={cn(
              "resize-none min-h-[44px] sm:min-h-[60px] flex-1 text-sm sm:text-base transition-all",
              encrypted && "border-green-500/20 focus:border-green-500/40"
            )}
            data-testid="input-message"
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSend}
              disabled={
                disabled || isEncrypting || (!message.trim() && !attachedFile)
              }
              size="icon"
              className={cn(
                "h-[44px] w-[44px] sm:h-[60px] sm:w-[60px] transition-all",
                isEncrypting && "animate-pulse"
              )}
              data-testid="button-send-message"
            >
              {isEncrypting ? (
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 animate-bounce" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {encrypted ? "Send encrypted message" : "Send message"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Encryption Animation Overlay */}
      {isEncrypting && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
        </div>
      )}
    </div>
  );
}
