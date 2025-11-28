import { useCallback, useRef } from "react";

const SOUND_ENABLED_KEY = "decentrachat-sound-enabled";

// Custom sound files from public folder
const SOUNDS = {
  send: "/send.mp3",
  receive: "/receive.mp3",
  pin: "/pin.mp3",
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
