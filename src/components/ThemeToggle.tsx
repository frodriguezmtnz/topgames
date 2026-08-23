"use client";

import { useEffect, useState } from "react";

function currentTheme(): boolean {
  try {
    const stored = localStorage.getItem("topgames-theme");
    if (stored) return stored === "light";
    return window.matchMedia("(prefers-color-scheme: light)").matches;
  } catch {
    return false;
  }
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Montaje: sincronizar desde el store externo (localStorage) tras el SSR.
    // El guard `mounted` hace el primer render deterministico en ambos lados,
    // evitando el hydration mismatch. Este setState en medio del efecto es el
    // patron sancionado por React para estado procedente de sistemas externos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLight(currentTheme());
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700"
      />
    );
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