import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConnectionStatusProps {
  connected: boolean;
  network?: string;
}

export function ConnectionStatus({ connected, network = "Local" }: ConnectionStatusProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant={connected ? "default" : "secondary"} 
          className="gap-2"
          data-testid="badge-connection-status"
        >
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {connected ? network : 'Disconnected'}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{connected ? 'Connected to blockchain' : 'Not connected'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
