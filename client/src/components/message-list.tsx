import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { useEffect, useRef } from "react";
import { Pin } from "lucide-react";
import type { FileAttachment } from "./file-attachment";

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  verified: boolean;
  senderAvatar?: string;
  isPinned?: boolean;
  file?: FileAttachment;
}

interface MessageListProps {
  messages: Message[];
  currentUserAddress: string | null;
  userAvatar?: string;
  pinnedMessages?: Message[];
  onPinMessage?: (messageId: string) => void;
  onUnpinMessage?: (messageId: string) => void;
}

export function MessageList({
  messages,
  currentUserAddress,
  userAvatar,
  pinnedMessages = [],
  onPinMessage,
  onUnpinMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">
            Start the conversation with an encrypted message
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Pinned Messages Section */}
      {pinnedMessages.length > 0 && (
        <div className="border-b bg-muted/30 p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Pin className="h-3 w-3" />
            <span>Pinned Messages ({pinnedMessages.length})</span>
          </div>
          <div className="space-y-1">
            {pinnedMessages.slice(0, 3).map((message) => (
              <div
                key={`pinned-${message.id}`}
                className="flex items-center gap-2 text-sm bg-background/50 rounded px-2 py-1 cursor-pointer hover:bg-background/80 transition-colors"
                onClick={() => {
                  // Scroll to message
                  const el = document.getElementById(`message-${message.id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                <span className="text-xs">{message.senderAvatar || "👤"}</span>
                <span className="truncate flex-1">{message.content}</span>
                {onUnpinMessage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpinMessage(message.id);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pin className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
        {messages.map((message) => {
          const isOwnMessage = currentUserAddress
            ? message.sender.toLowerCase() === currentUserAddress.toLowerCase()
            : false;
          return (
            <MessageBubble
              key={message.id}
              id={message.id}
              sender={message.sender}
              content={message.content}
              timestamp={message.timestamp}
              verified={message.verified}
              isOwnMessage={isOwnMessage}
              senderAvatar={isOwnMessage ? userAvatar : message.senderAvatar}
              isPinned={message.isPinned}
              file={message.file}
              onPin={onPinMessage ? () => onPinMessage(message.id) : undefined}
              onUnpin={
                onUnpinMessage ? () => onUnpinMessage(message.id) : undefined
              }
            />
          );
        })}
      </ScrollArea>
    </div>
  );
}
