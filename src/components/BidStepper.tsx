"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

/**
 * Stepper visual de monto estilo uprank.lol: display grande y prominente con
 * botones − / + para subir o bajar, con repeat al mantener pulsado y campo
 * editable para escribir el importe exacto.
 */
export default function BidStepper({
  value,
  onChange,
  min = 5,
  max = 999999,
  step = 1,
}: Props) {
  const [draft, setDraft] = useState(String(value));
  const held = useRef<ReturnType<typeof setInterval> | null>(null);

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(String(value));
  }

  useEffect(() => {
    const release = () => {
      if (held.current) {
        clearInterval(held.current);
        held.current = null;
      }
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      release();
    };
  }, []);

  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));

  const bump = (dir: 1 | -1) => {
    const next = clamp(value + dir * step);
    onChange(next);
    setDraft(String(next));
  };

  const hold = (dir: 1 | -1) => {
    bump(dir);
    if (held.current) return;
    held.current = setInterval(() => bump(dir), 85);
  };

  const commit = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    setDraft(digits);
    const n = Number(digits);
    if (Number.isFinite(n) && n >= 0) onChange(n);
  };

  const blur = (raw: string) => {
    const n = Number(raw);
    const next = Number.isFinite(n) ? clamp(n) : min;
    onChange(next);
    setDraft(String(next));
  };

  const btn =
    "flex h-12 w-12 select-none items-center justify-center rounded-full border border-neutral-700 bg-neutral-950 text-xl font-bold text-neutral-200 transition hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-neutral-700 disabled:hover:bg-neutral-950 disabled:hover:text-neutral-200";

  return (
    <div className="flex items-center justify-center gap-5">
      <button
        type="button"
        aria-label="Bajar la puja"
        className={`${btn} touch-none`}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={() => hold(-1)}
        disabled={value <= min}
      >
        −
      </button>

      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
          Lifetime total
        </span>
        <span className="relative flex items-baseline justify-center">
          <span className="mr-1 text-2xl font-bold text-emerald-500">€</span>
          <input
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={(e) => commit(e.target.value)}
            onBlur={(e) => blur(e.target.value)}
            aria-label="Importe de la puja en euros"
            className="w-40 bg-transparent text-center text-6xl font-black tabular-nums tracking-tight text-neutral-50 outline-none selection:bg-emerald-500/30"
          />
        </span>
        <span className="text-xs text-neutral-500">one-time, per entry</span>
      </div>

      <button
        type="button"
        aria-label="Subir la puja"
        className={`${btn} touch-none`}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={() => hold(1)}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}