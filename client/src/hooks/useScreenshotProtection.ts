import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseScreenshotProtectionOptions {
  enabled?: boolean;
  onScreenshotAttempt?: () => void;
  blurOnInactive?: boolean;
  preventSelection?: boolean;
  preventContextMenu?: boolean;
  preventPrint?: boolean;
  preventDevTools?: boolean;
  aggressiveProtection?: boolean; // More aggressive PrintScreen protection
}

interface ScreenshotProtectionState {
  isBlurred: boolean;
  isProtected: boolean;
  attemptCount: number;
}

export function useScreenshotProtection({
  enabled = true,
  onScreenshotAttempt,
  blurOnInactive = true,
  preventSelection = true,
  preventContextMenu = true,
  preventPrint = true,
  preventDevTools = true,
  aggressiveProtection = true,
}: UseScreenshotProtectionOptions = {}) {
  const { toast } = useToast();
  const [state, setState] = useState<ScreenshotProtectionState>({
    isBlurred: false,
    isProtected: enabled,
    attemptCount: 0,
  });

  const blurTimeoutRef = useRef<NodeJS.Timeout>();
  const lastVisibilityChangeRef = useRef<number>(Date.now());
  const lastKeyPressRef = useRef<number>(0);

  const showWarning = useCallback(
    (message: string) => {
      toast({
        title: "🔒 Content Protected",
        description: message,
        variant: "destructive",
        duration: 3000,
      });

      setState((prev) => ({ ...prev, attemptCount: prev.attemptCount + 1 }));
      onScreenshotAttempt?.();
    },
    [toast, onScreenshotAttempt]
  );

  const blurContent = useCallback(() => {
    setState((prev) => ({ ...prev, isBlurred: true }));
  }, []);

  const unblurContent = useCallback(() => {
    // Small delay before unblurring to prevent quick screenshot attempts
    blurTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, isBlurred: false }));
    }, 300);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // ============ KEYBOARD SHORTCUTS DETECTION ============
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      lastKeyPressRef.current = now;

      // PrintScreen - blur IMMEDIATELY before capture
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        // Blur instantly - this happens BEFORE the screenshot is taken
        setState((prev) => ({ ...prev, isBlurred: true }));
        document.body.classList.add("screenshot-blur-active");

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        showWarning("Screenshots are disabled for privacy protection.");

        // Keep blurred longer to ensure screenshot captures blur
        setTimeout(() => {
          setState((prev) => ({ ...prev, isBlurred: false }));
          document.body.classList.remove("screenshot-blur-active");
        }, 2000);
        return false;
      }

      // macOS screenshot shortcuts
      if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) {
        setState((prev) => ({ ...prev, isBlurred: true }));
        document.body.classList.add("screenshot-blur-active");
        e.preventDefault();
        showWarning("Screenshots are disabled for privacy protection.");
        setTimeout(() => {
          setState((prev) => ({ ...prev, isBlurred: false }));
          document.body.classList.remove("screenshot-blur-active");
        }, 2000);
        return;
      }

      // Windows Snipping Tool (Win+Shift+S)
      if (
        (e.metaKey || e.key === "Meta") &&
        e.shiftKey &&
        e.key.toLowerCase() === "s"
      ) {
        setState((prev) => ({ ...prev, isBlurred: true }));
        document.body.classList.add("screenshot-blur-active");
        e.preventDefault();
        showWarning("Screenshots are disabled for privacy protection.");
        setTimeout(() => {
          setState((prev) => ({ ...prev, isBlurred: false }));
          document.body.classList.remove("screenshot-blur-active");
        }, 2000);
        return;
      }

      // Prevent Ctrl+P (Print)
      if (preventPrint && e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        showWarning("Printing is disabled for privacy protection.");
        return;
      }

      // Prevent DevTools shortcuts
      if (preventDevTools) {
        // F12
        if (e.key === "F12") {
          e.preventDefault();
          showWarning("Developer tools are restricted.");
          return;
        }
        // Ctrl+Shift+I / Cmd+Option+I
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          e.key.toLowerCase() === "i"
        ) {
          e.preventDefault();
          showWarning("Developer tools are restricted.");
          return;
        }
        // Ctrl+Shift+J / Cmd+Option+J
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          e.key.toLowerCase() === "j"
        ) {
          e.preventDefault();
          showWarning("Developer tools are restricted.");
          return;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key.toLowerCase() === "u") {
          e.preventDefault();
          showWarning("View source is restricted.");
          return;
        }
      }

      // Prevent Ctrl+S (Save)
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        showWarning("Saving is disabled for privacy protection.");
        return;
      }
    };

    // Also capture on keyup for PrintScreen (some systems fire it here)
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        e.stopPropagation();
        // Keep blurred
        setState((prev) => ({ ...prev, isBlurred: true }));
        document.body.classList.add("screenshot-blur-active");

        setTimeout(() => {
          setState((prev) => ({ ...prev, isBlurred: false }));
          document.body.classList.remove("screenshot-blur-active");
        }, 2000);
      }
    };

    // ============ CLIPBOARD MONITORING (Detect PrintScreen pastes) ============
    const handleClipboardChange = async () => {
      if (!aggressiveProtection) return;

      try {
        // Check if clipboard has image data (likely from PrintScreen)
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          if (
            item.types.includes("image/png") ||
            item.types.includes("image/jpeg")
          ) {
            // Screenshot was captured! Clear clipboard
            try {
              await navigator.clipboard.writeText("");
              showWarning("Screenshot cleared from clipboard.");
            } catch {
              // Clipboard write may fail
            }
          }
        }
      } catch {
        // Clipboard read requires permission, which is fine
      }
    };

    // ============ VISIBILITY CHANGE (SNAPCHAT STYLE) ============
    const handleVisibilityChange = () => {
      if (!blurOnInactive) return;

      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChangeRef.current;
      lastVisibilityChangeRef.current = now;

      if (document.visibilityState === "hidden") {
        // Immediately blur when tab loses focus
        blurContent();
      } else {
        // Check for rapid visibility changes (potential screenshot on mobile)
        if (timeSinceLastChange < 500) {
          showWarning("Screenshot attempt detected.");
        }
        unblurContent();
      }
    };

    // ============ WINDOW BLUR/FOCUS ============
    const handleWindowBlur = () => {
      if (blurOnInactive) {
        blurContent();
      }
    };

    const handleWindowFocus = () => {
      if (blurOnInactive) {
        unblurContent();
      }
    };

    // ============ CONTEXT MENU (RIGHT CLICK) ============
    const handleContextMenu = (e: MouseEvent) => {
      if (preventContextMenu) {
        e.preventDefault();
        showWarning("Right-click is disabled for privacy protection.");
      }
    };

    // ============ SELECTION ============
    const handleSelectStart = (e: Event) => {
      if (preventSelection) {
        e.preventDefault();
      }
    };

    // ============ DRAG START ============
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // ============ COPY ============
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      showWarning("Copying is disabled for privacy protection.");
    };

    // ============ BEFORE PRINT ============
    const handleBeforePrint = () => {
      if (preventPrint) {
        blurContent();
        showWarning("Printing is disabled for privacy protection.");
      }
    };

    const handleAfterPrint = () => {
      unblurContent();
    };

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("keyup", handleKeyUp, { capture: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("copy", handleCopy);
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    // Monitor clipboard periodically for screenshot captures
    let clipboardInterval: NodeJS.Timeout | null = null;
    if (aggressiveProtection) {
      clipboardInterval = setInterval(handleClipboardChange, 1000);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("keyup", handleKeyUp, { capture: true });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("copy", handleCopy);
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);

      if (clipboardInterval) {
        clearInterval(clipboardInterval);
      }

      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }

      document.body.classList.remove("screenshot-blur-active");
    };
  }, [
    enabled,
    blurOnInactive,
    preventContextMenu,
    preventSelection,
    preventPrint,
    preventDevTools,
    aggressiveProtection,
    showWarning,
    blurContent,
    unblurContent,
  ]);

  return {
    isBlurred: state.isBlurred,
    isProtected: state.isProtected,
    attemptCount: state.attemptCount,
    blurContent,
    unblurContent,
  };
}
