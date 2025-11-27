import { useCallback, useRef } from "react";

const SOUND_ENABLED_KEY = "decentrachat-sound-enabled";

// Base64 encoded short notification sounds (very small, embedded)
const SOUNDS = {
  send: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2NlZudk4h4bGFgZnB+jZqkqKSajX1wZ2VocX6OnaijpJqMfnJnZGhwfoySm5+cmI+CdmpjYmhydIGKkZSVk46FeXJubG1vcHR7goiLi4mDfHVwbWxtb3J1e4GGh4eFgHp1cW9vcHJ0d3t/goSEgoB8eHVycXFydHZ4e36BgoKBf3x5dnRzc3R1dnh7fX9/f359e3l3dnV1dXZ3eHp8fX19fXx7enl4d3d3eHl6e3x8fHx8e3p5eHh4eHl5ent7e3t7e3t6enl5eXl5eXp6enp6enp6enl5eXl5eXl5enp6enp6enp6enl5eXl5eXl5eXp6enp6enp6",
  receive:
    "data:audio/wav;base64,UklGRpQGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXAGAAB/goaIiYmIhoR/e3ZybGhkYmJkZ2xyfYaMkZSWlpSSjYaDfXl1cm9tb3J3fYOKj5OWl5aTj4qFgHp2cm9tbXF2fIOJjpKVlpWSkIuGgXx3c3BubXB0eX+FipCTlZWTkY2IhH97d3RxcHF0eH2CiIyQkpOSkI2JhYF8eHVzc3N1eHyAhImMj5CQjo2Jh4N/fHl3dnZ2eHp9gIWIi42NjYuJhoSAfnx6eXh4eXp8foGEh4mKioqIhoSCgH58e3p6ent8fX+BhIaHiIiHhoWDgn9+fXx7e3t8fX5/gYOEhYaGhYSEg4KBgH9+fn1+fn5/gIGCg4SEhIODgoKBgYCAf39/f39/gICBgYKCgoKCgoGBgYGAgICAf4CAgICAgYGBgYGBgYGBgYGAgICAgICAgICAgIGBgYGBgYGBgYGBgYCAgICAgA==",
  pin: "data:audio/wav;base64,UklGRlIGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YS4GAAB8f4KFh4iIh4WCfnp2cW1pZ2VlZmlucXd+hYuPkpSTkY6KhYB7dnJvbWxucXV6gIWKjpGSko+MiYR/enZycG9vcXR4fYKGio2PkI+NioaAfXl1c3FxcnR3e3+DiIuNjo2Ni4eDf3t4dXNzc3V3en2AhIeKi4uKiYaEgX56d3Z1dXZ3eXt9gIOGiImJiIaEgn98enl4eHh5enx+gIKEhoeHhoWDgn9+fHt6enp7fH1+gIGDhIWFhYSEg4KBgH9+fn19fn5/gIGCg4ODg4OCgoGBgH9/f39/f4CAgIGBgoKCgoKBgYGAgIB/f39/f4CAgICBgYGBgYGBgYGAgICAgH9/f39/gICAgICAgICAgICAgICAf3+AgICAgICAgICA",
};

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback(
    async (type: "send" | "receive" | "pin") => {
      if (localStorage.getItem(SOUND_ENABLED_KEY) === "false") return;

      try {
        const audio = new Audio(SOUNDS[type]);
        audio.volume = 0.5;
        await audio.play();
      } catch (error) {
        // Fallback to Web Audio API beep
        try {
          const ctx = getAudioContext();
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.frequency.value =
            type === "send" ? 800 : type === "receive" ? 600 : 1000;
          oscillator.type = "sine";

          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            ctx.currentTime + 0.1
          );

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.1);
        } catch (e) {
          console.warn("Could not play sound:", e);
        }
      }
    },
    [getAudioContext]
  );

  const playSend = useCallback(() => playSound("send"), [playSound]);
  const playReceive = useCallback(() => playSound("receive"), [playSound]);
  const playPin = useCallback(() => playSound("pin"), [playSound]);

  const isEnabled = useCallback(() => {
    return localStorage.getItem(SOUND_ENABLED_KEY) !== "false";
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(SOUND_ENABLED_KEY, enabled ? "true" : "false");
  }, []);

  return {
    playSend,
    playReceive,
    playPin,
    isEnabled,
    setEnabled,
  };
}
