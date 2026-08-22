"use client";

import { useState } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem("topgames-theme");
      if (stored) return stored === "light";
      return window.matchMedia("(prefers-color-scheme: light)").matches;
    } catch {
      return false;
    }
  });

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
    try {
      localStorage.setItem("topgames-theme", next ? "light" : "dark");
    } catch {
      // localStorage puede no estar disponible (modo privado)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 transition hover:border-neutral-500 hover:text-neutral-100"
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}