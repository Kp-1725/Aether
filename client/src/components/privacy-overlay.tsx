import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivacyOverlayProps {
  isActive: boolean;
  message?: string;
}

export function PrivacyOverlay({
  isActive,
  message = "Content hidden for privacy",
}: PrivacyOverlayProps) {
  if (!isActive) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-background/95 backdrop-blur-xl",
        "animate-in fade-in duration-150"
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20">
            <EyeOff className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold flex items-center gap-2 justify-center">
            <Lock className="h-5 w-5" />
            Privacy Mode Active
          </h3>
          <p className="text-muted-foreground max-w-xs">{message}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
          <Shield className="h-4 w-4 text-green-500" />
          <span>Your messages are protected</span>
        </div>
      </div>
    </div>
  );
}

interface PrivacyBadgeProps {
  isProtected: boolean;
  attemptCount?: number;
  className?: string;
}

export function PrivacyBadge({
  isProtected,
  attemptCount = 0,
  className,
}: PrivacyBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        isProtected
          ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      {isProtected ? (
        <>
          <Eye className="h-3 w-3" />
          <span>Protected</span>
          {attemptCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 text-red-500 rounded-full text-[10px]">
              {attemptCount}
            </span>
          )}
        </>
      ) : (
        <>
          <EyeOff className="h-3 w-3" />
          <span>Unprotected</span>
        </>
      )}
    </div>
  );
}
