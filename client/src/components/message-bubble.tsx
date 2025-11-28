import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, Pin, MoreVertical } from "lucide-react";
import { truncateAddress } from "@/lib/web3";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FilePreview, type FileAttachment } from "@/components/file-attachment";

interface MessageBubbleProps {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  verified: boolean;
  isOwnMessage: boolean;
  senderAvatar?: string;
  isPinned?: boolean;
  file?: FileAttachment;
  onPin?: () => void;
  onUnpin?: () => void;
}

export function MessageBubble({
  id,
  sender,
  content,
  timestamp,
  verified,
  isOwnMessage,
  senderAvatar,
  isPinned,
  file,
  onPin,
  onUnpin,
}: MessageBubbleProps) {
  return (
    <div
      id={`message-${id}`}
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      } mb-4 group`}
    >
      <div
        className={`flex gap-3 max-w-[70%] ${
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10 border-2 border-border">
            <AvatarFallback className="text-xl bg-muted">
              {senderAvatar || "👤"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Message content */}
        <div
          className={`flex flex-col gap-1 ${
            isOwnMessage ? "items-end" : "items-start"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium font-mono"
              data-testid="text-message-sender"
            >
              {truncateAddress(sender)}
            </span>
            {verified && (
              <Tooltip>
                <TooltipTrigger>
                  <CheckCircle2
                    className="h-3 w-3 text-green-500"
                    data-testid="icon-verified"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verified on blockchain</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isPinned && (
              <Tooltip>
                <TooltipTrigger>
                  <Pin className="h-3 w-3 text-primary" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pinned message</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="relative flex items-start gap-1">
            <Card
              className={`p-3 ${
                isOwnMessage ? "bg-primary text-primary-foreground" : ""
              } ${isPinned ? "ring-1 ring-primary/50" : ""}`}
            >
              {/* File attachment */}
              {file && (
                <div className="mb-2">
                  <FilePreview file={file} />
                </div>
              )}
              {/* Text content */}
              {content && (
                <p
                  className="text-sm whitespace-pre-wrap break-words"
                  data-testid="text-message-content"
                >
                  {content}
                </p>
              )}
            </Card>

            {/* Message actions */}
            {(onPin || onUnpin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                  {isPinned ? (
                    <DropdownMenuItem onClick={onUnpin}>
                      <Pin className="h-4 w-4 mr-2" />
                      Unpin message
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={onPin}>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin message
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs text-muted-foreground"
              data-testid="text-message-time"
            >
              {timestamp.toLocaleTimeString()}
            </span>
            <Lock className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
