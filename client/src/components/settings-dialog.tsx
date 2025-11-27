import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { useNotifications } from "@/hooks/useNotifications";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
  Bell,
  Volume2,
  Palette,
  Sun,
  Moon,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Simple toggle button component to replace Switch
function ToggleButton({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-input"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

// Custom theme colors
const THEME_COLORS = [
  { name: "Purple", value: "purple", hue: "265" },
  { name: "Blue", value: "blue", hue: "220" },
  { name: "Green", value: "green", hue: "142" },
  { name: "Orange", value: "orange", hue: "24" },
  { name: "Pink", value: "pink", hue: "330" },
  { name: "Cyan", value: "cyan", hue: "185" },
];

const THEME_COLOR_KEY = "decentrachat-theme-color";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const {
    requestPermission,
    isEnabled: isNotificationsEnabled,
    disable: disableNotifications,
  } = useNotifications();
  const {
    isEnabled: isSoundEnabled,
    setEnabled: setSoundEnabled,
    playSend,
  } = useSoundEffects();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [selectedColor, setSelectedColor] = useState(() => {
    return localStorage.getItem(THEME_COLOR_KEY) || "purple";
  });

  useEffect(() => {
    setNotificationsEnabled(isNotificationsEnabled());
    setSoundEnabledState(isSoundEnabled());
  }, [open, isNotificationsEnabled, isSoundEnabled]);

  const handleNotificationsChange = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      setNotificationsEnabled(granted);
    } else {
      disableNotifications();
      setNotificationsEnabled(false);
    }
  };

  const handleSoundChange = (enabled: boolean) => {
    setSoundEnabled(enabled);
    setSoundEnabledState(enabled);
    if (enabled) {
      playSend(); // Play a test sound
    }
  };

  const handleColorChange = (color: string, hue: string) => {
    setSelectedColor(color);
    localStorage.setItem(THEME_COLOR_KEY, color);

    // Update CSS custom properties for the primary color
    const root = document.documentElement;
    root.style.setProperty("--primary-hue", hue);

    // Dispatch event for other components to react
    window.dispatchEvent(
      new CustomEvent("theme-color-change", { detail: { color, hue } })
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>Customize your chat experience</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Theme Mode</Label>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex-1 gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex-1 gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>

          <Separator />

          {/* Accent Color */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Accent Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value, color.hue)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all hover:scale-110",
                    selectedColor === color.value &&
                      "ring-2 ring-offset-2 ring-offset-background"
                  )}
                  style={{
                    backgroundColor: `hsl(${color.hue}, 70%, 50%)`,
                    boxShadow:
                      selectedColor === color.value
                        ? `0 0 0 2px hsl(${color.hue}, 70%, 50%)`
                        : undefined,
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified of new messages
                </p>
              </div>
            </div>
            <ToggleButton
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationsChange}
            />
          </div>

          <Separator />

          {/* Sound Effects */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Sound Effects</Label>
                <p className="text-xs text-muted-foreground">
                  Play sounds for messages
                </p>
              </div>
            </div>
            <ToggleButton
              checked={soundEnabled}
              onCheckedChange={handleSoundChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
