import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseScreenshotDetectionOptions {
  enabled?: boolean;
  onScreenshotDetected?: () => void;
  notifyPeers?: (message: string) => void;
}

export function useScreenshotDetection({
  enabled = true,
  onScreenshotDetected,
  notifyPeers,
}: UseScreenshotDetectionOptions = {}) {
  const { toast } = useToast();

  const handleScreenshot = useCallback(() => {
    // Show warning toast
    toast({
      title: "⚠️ Screenshot Detected",
      description: "Someone may have taken a screenshot of this conversation.",
      variant: "destructive",
      duration: 5000,
    });

    // Call custom handler if provided
    onScreenshotDetected?.();

    // Notify peers if function provided
    notifyPeers?.("📸 A user took a screenshot of the chat");
  }, [toast, onScreenshotDetected, notifyPeers]);

  useEffect(() => {
    if (!enabled) return;

    // Method 1: Keyboard shortcuts detection (PrintScreen, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === "PrintScreen") {
        handleScreenshot();
      }

      // Cmd+Shift+3 or Cmd+Shift+4 (macOS screenshot)
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) {
        handleScreenshot();
      }

      // Windows Snipping Tool (Win+Shift+S)
      if (e.metaKey && e.shiftKey && e.key === "s") {
        handleScreenshot();
      }

      // Ctrl+PrintScreen
      if (e.ctrlKey && e.key === "PrintScreen") {
        handleScreenshot();
      }
    };

    // Method 2: Visibility change detection (can indicate screenshot on some devices)
    const handleVisibilityChange = () => {
      // On iOS, taking a screenshot briefly changes visibility
      // This is a heuristic and not 100% reliable
      if (document.visibilityState === "hidden") {
        // Could be a screenshot, but also could be user switching apps
        // We don't trigger here to avoid false positives
      }
    };

    // Method 3: Detect screen capture API usage (if browser supports it)
    const detectScreenCapture = () => {
      if (
        "mediaDevices" in navigator &&
        "getDisplayMedia" in navigator.mediaDevices
      ) {
        // Monitor for screen capture requests
        const originalGetDisplayMedia =
          navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);

        navigator.mediaDevices.getDisplayMedia = async function (constraints) {
          handleScreenshot();
          return originalGetDisplayMedia(constraints);
        };
      }
    };

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Try to detect screen capture API
    detectScreenCapture();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, handleScreenshot]);

  return { handleScreenshot };
}
