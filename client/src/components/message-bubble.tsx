import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock } from "lucide-react";
import { truncateAddress } from "@/lib/web3";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageBubbleProps {
  sender: string;
  content: string;
  timestamp: Date;
  verified: boolean;
  isOwnMessage: boolean;
}

export function MessageBubble({ sender, content, timestamp, verified, isOwnMessage }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium font-mono" data-testid="text-message-sender">
            {truncateAddress(sender)}
          </span>
          {verified && (
            <Tooltip>
              <TooltipTrigger>
                <CheckCircle2 className="h-3 w-3 text-green-500" data-testid="icon-verified" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Verified on blockchain</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <Card className={`p-3 ${isOwnMessage ? 'bg-primary text-primary-foreground' : ''}`}>
          <p className="text-sm" data-testid="text-message-content">{content}</p>
        </Card>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground" data-testid="text-message-time">
            {timestamp.toLocaleTimeString()}
          </span>
          <Lock className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
