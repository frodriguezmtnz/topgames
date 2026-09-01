"use client";

import { useEffect, useRef, useState } from "react";
import { Lottie, type LottieHandle } from "lottie-react";

const MESSAGES = [
  "This page rage-quit before you arrived.",
  "You wandered off the map. Watch your step.",
  "Oops, someone forgot to press START.",
  "The princess is in another castle.",
  "This page got nerfed into oblivion.",
  "You need to buy the DLC to unlock this URL.",
  "This page took the blue pill. You found the red one.",
  "Respawn point not set. Spawn back at the menu.",
  "The page is hiding in a tall patch of grass.",
  "This place is as empty as a public lobby at 3 a.m.",
];

export default function NotFoundMessage() {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const lottieRef = useRef<LottieHandle>(null);

  useEffect(() => {
    // Escoger un mensaje al azar y leer la preferencia de animacion en el cliente.
    // El guard `mounted` mantiene el primer render identico al SSR (sin hydration mismatch),
    // mismo patron que ThemeToggle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="flex flex-col items-center justify-center"
        style={{ width: 240, height: 240 }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {/* loop=false: el rebote dura ~3s (<5s), cumpliendo WCAG 2.2.2 sin control
          de pausa. El click reinicia la animacion (play() arranca desde el frame 0
          al estar terminada), como golpear el bloque en Mario. */}
      <button
        type="button"
        onClick={() => lottieRef.current?.play()}
        aria-label="Replay animation"
        title="Hit the block"
        className="cursor-pointer rounded-2xl"
      >
        <Lottie
          src="/lottie/404-block.json"
          lottieRef={lottieRef}
          loop={false}
          autoplay={!reducedMotion}
          aria-hidden="true"
          style={{ width: 240, height: 240 }}
        />
      </button>
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}