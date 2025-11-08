import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { useEffect, useRef } from "react";

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  verified: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserAddress: string | null;
}

export function MessageList({ messages, currentUserAddress }: MessageListProps) {
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
          <p className="text-sm">Start the conversation with an encrypted message</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4" ref={scrollRef as any}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          sender={message.sender}
          content={message.content}
          timestamp={message.timestamp}
          verified={message.verified}
          isOwnMessage={message.sender === currentUserAddress}
        />
      ))}
    </ScrollArea>
  );
}
