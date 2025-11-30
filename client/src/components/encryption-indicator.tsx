import { useState, useEffect } from "react";
import { Lock, Unlock, Shield, ShieldCheck, Key } from "lucide-react";
import { cn } from "@/lib/utils";

interface EncryptionAnimationProps {
  isEncrypting: boolean;
  onComplete?: () => void;
}

export function EncryptionAnimation({
  isEncrypting,
  onComplete,
}: EncryptionAnimationProps) {
  const [phase, setPhase] = useState<"idle" | "encrypting" | "complete">(
    "idle"
  );

  useEffect(() => {
    if (isEncrypting) {
      setPhase("encrypting");
      const timer = setTimeout(() => {
        setPhase("complete");
        onComplete?.();
        // Reset after animation
        setTimeout(() => setPhase("idle"), 1000);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isEncrypting, onComplete]);

  if (phase === "idle") return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div
        className={cn(
          "flex flex-col items-center gap-3 p-6 rounded-2xl bg-background/95 border shadow-2xl backdrop-blur-sm",
          "animate-in zoom-in-95 duration-200",
          phase === "complete" && "animate-out zoom-out-95 duration-300"
        )}
      >
        <div className="relative">
          {phase === "encrypting" && (
            <>
              <Shield className="h-12 w-12 text-primary animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary-foreground animate-spin" />
              </div>
            </>
          )}
          {phase === "complete" && (
            <ShieldCheck className="h-12 w-12 text-green-500 animate-in zoom-in duration-200" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {phase === "encrypting" && "Encrypting message..."}
            {phase === "complete" && "Message encrypted!"}
          </p>
          <p className="text-xs text-muted-foreground">
            {phase === "encrypting" && "AES-256 encryption"}
            {phase === "complete" && "Sent securely via P2P"}
          </p>
        </div>
      </div>
    </div>
  );
}

interface EncryptionBadgeProps {
  encrypted: boolean;
  algorithm?: string;
  className?: string;
}

export function EncryptionBadge({
  encrypted,
  algorithm = "AES-256",
  className,
}: EncryptionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
        encrypted
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400",
        className
      )}
    >
      {encrypted ? (
        <>
          <Lock className="h-3 w-3" />
          <span>{algorithm}</span>
        </>
      ) : (
        <>
          <Unlock className="h-3 w-3" />
          <span>Not Encrypted</span>
        </>
      )}
    </div>
  );
}

interface EncryptionStatusProps {
  encryptionKey?: string | null;
  className?: string;
}

export function EncryptionStatus({
  encryptionKey,
  className,
}: EncryptionStatusProps) {
  const hasKey = !!encryptionKey;

  // Generate a simple fingerprint visualization from the key
  const generateFingerprint = (key: string): string[] => {
    // Create a simple hash-like representation
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(16, "0").toUpperCase();
    return hex.match(/.{1,4}/g) || [];
  };

  const fingerprintBlocks = encryptionKey
    ? generateFingerprint(encryptionKey)
    : [];

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-muted/50 border",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full",
          hasKey ? "bg-green-500/20" : "bg-yellow-500/20"
        )}
      >
        {hasKey ? (
          <ShieldCheck className="h-5 w-5 text-green-500" />
        ) : (
          <Shield className="h-5 w-5 text-yellow-500" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">
          {hasKey ? "End-to-End Encrypted" : "No Encryption Key Set"}
        </p>
        {hasKey && fingerprintBlocks.length > 0 ? (
          <div className="flex gap-1 mt-1">
            {fingerprintBlocks.map((block, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono text-muted-foreground"
              >
                {block}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {hasKey
              ? "Messages are encrypted before sending"
              : "Set a key to encrypt messages"}
          </p>
        )}
      </div>
    </div>
  );
}

interface MessageEncryptionIndicatorProps {
  status: "encrypting" | "sending" | "sent" | "delivered";
}

export function MessageEncryptionIndicator({
  status,
}: MessageEncryptionIndicatorProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "encrypting":
        return {
          icon: Key,
          text: "Encrypting...",
          color: "text-yellow-500",
          animate: true,
        };
      case "sending":
        return {
          icon: Lock,
          text: "Sending...",
          color: "text-blue-500",
          animate: true,
        };
      case "sent":
        return {
          icon: ShieldCheck,
          text: "Sent",
          color: "text-green-500",
          animate: false,
        };
      case "delivered":
        return {
          icon: ShieldCheck,
          text: "Delivered",
          color: "text-green-500",
          animate: false,
        };
    }
  };

  const { icon: Icon, text, color, animate } = getStatusInfo();

  return (
    <div className={cn("inline-flex items-center gap-1 text-xs", color)}>
      <Icon className={cn("h-3 w-3", animate && "animate-pulse")} />
      <span>{text}</span>
    </div>
  );
}
