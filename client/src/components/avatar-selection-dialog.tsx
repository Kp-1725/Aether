import { useState, useEffect } from "react";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Avatar options - emoji-based avatars for simplicity
const AVATAR_OPTIONS = [
  // People
  "👤",
  "👨",
  "👩",
  "🧑",
  "👧",
  "👦",
  "🧒",
  "👶",
  "👴",
  "👵",
  "🧓",
  // Fantasy & Fun
  "🦸",
  "🦹",
  "🧙",
  "🧚",
  "🧛",
  "🧜",
  "🧝",
  "🧞",
  "🧟",
  "🤖",
  "👽",
  "👻",
  "💀",
  "🎃",
  "👾",
  // Animals
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
  "🦆",
  "🦅",
  "🦉",
  "🦇",
  "🐺",
  "🐴",
  "🦄",
  "🐝",
  "🦋",
  "🐌",
  "🐞",
  "🐙",
  "🦑",
  "🦐",
  "🦀",
  "🐡",
  "🐠",
  "🐟",
  "🐬",
  "🐳",
  "🦈",
  "🐊",
  "🐅",
  "🐆",
  "🦓",
  "🦍",
  "🦧",
  "🐘",
  "🦛",
  "🦏",
  "🐪",
  "🦒",
  // Nature & Objects
  "🌸",
  "🌺",
  "🌻",
  "🌷",
  "🌹",
  "🍀",
  "🌵",
  "🌴",
  "🌲",
  "🌳",
  "🍄",
  "🌙",
  "⭐",
  "🌈",
  "☀️",
  "🔥",
  "💧",
  "❄️",
  "⚡",
  "🌊",
  // Symbols & Shapes
  "💎",
  "🎈",
  "🎀",
  "🎁",
  "🎮",
  "🎯",
  "🎨",
  "🎭",
  "🎪",
  "🎬",
  "🎤",
  "🎧",
  "🎸",
  "🎺",
  "🎻",
  "🥁",
  "⚽",
  "🏀",
  "🏈",
  "⚾",
  "🎾",
  "🏐",
  "🎱",
  // Food
  "🍕",
  "🍔",
  "🍟",
  "🌭",
  "🍿",
  "🧁",
  "🍰",
  "🍩",
  "🍪",
  "🍫",
  "🍬",
  "🍭",
  "🍎",
  "🍊",
  "🍋",
  "🍌",
  "🍉",
  "🍇",
  "🍓",
  "🍑",
  "🥑",
  "🌶️",
  "🍄",
];

const STORAGE_KEY = "decentrachat-user-avatar";
const AVATAR_CHANGE_EVENT = "decentrachat-avatar-change";

interface AvatarSelectionDialogProps {
  onAvatarChange?: (avatar: string) => void;
  trigger?: React.ReactNode;
}

export function AvatarSelectionDialog({
  onAvatarChange,
  trigger,
}: AvatarSelectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || "👤";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedAvatar);
    // Dispatch custom event for same-tab sync
    window.dispatchEvent(
      new CustomEvent(AVATAR_CHANGE_EVENT, { detail: selectedAvatar })
    );
    onAvatarChange?.(selectedAvatar);
  }, [selectedAvatar, onAvatarChange]);

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className="h-10 w-10 p-0 rounded-full text-2xl"
          >
            {selectedAvatar}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Choose Your Avatar
          </DialogTitle>
          <DialogDescription>
            Select an icon to represent you in chat rooms. This will be visible
            to other participants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current selection preview */}
          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
            <div className="text-6xl">{selectedAvatar}</div>
          </div>

          {/* Avatar grid */}
          <ScrollArea className="h-64">
            <div className="grid grid-cols-8 gap-2 p-1">
              {AVATAR_OPTIONS.map((avatar, index) => (
                <button
                  key={`${avatar}-${index}`}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center text-2xl rounded-lg transition-all hover:bg-accent hover:scale-110",
                    selectedAvatar === avatar &&
                      "bg-primary/20 ring-2 ring-primary"
                  )}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to get and set the user avatar
export function useUserAvatar() {
  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || "👤";
  });

  const updateAvatar = (newAvatar: string) => {
    localStorage.setItem(STORAGE_KEY, newAvatar);
    window.dispatchEvent(
      new CustomEvent(AVATAR_CHANGE_EVENT, { detail: newAvatar })
    );
    setAvatar(newAvatar);
  };

  // Listen for storage changes (in case avatar is changed in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setAvatar(e.newValue);
      }
    };

    // Listen for custom event (same-tab sync)
    const handleAvatarChange = (e: CustomEvent<string>) => {
      setAvatar(e.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      AVATAR_CHANGE_EVENT,
      handleAvatarChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        AVATAR_CHANGE_EVENT,
        handleAvatarChange as EventListener
      );
    };
  }, []);

  return { avatar, updateAvatar };
}
