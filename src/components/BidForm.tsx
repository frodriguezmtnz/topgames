"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import BidStepper from "./BidStepper";
import SitePreview from "./SitePreview";
import RankPreview, { type RankPreviewData } from "./RankPreview";
import { formatMoney } from "@/lib/format";

const MIN_BID = 5;
const MAX_BID = 999999;

type StealPayload = {
  url: string;
  name: string;
  bidDollars: number;
  rank: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function isHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function BidForm() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [bid, setBid] = useState(MIN_BID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stealHint, setStealHint] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const debouncedUrl = useDebounced(url, 350);
  const debouncedBid = useDebounced(bid, 350);

  const canPreview = isHttpUrl(debouncedUrl.trim()) && debouncedBid >= MIN_BID;
  const previewKey = canPreview
    ? `/api/rank-preview?url=${encodeURIComponent(debouncedUrl.trim())}&bidCents=${Math.round(debouncedBid * 100)}`
    : null;
  const { data: preview, error: previewError } = useSWR<RankPreviewData>(
    previewKey,
    fetcher,
    { refreshInterval: 3000, revalidateOnFocus: false },
  );

  useEffect(() => {
    const onSteal = (e: Event) => {
      const d = (e as CustomEvent<StealPayload>).detail;
      setUrl(d.url);
      setName(d.name);
      setBid(d.bidDollars);
      setStealHint(`Taking the #${d.rank} spot. Bid is ready — just press the button below.`);
      setError(null);
      requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    };
    window.addEventListener("topgames:steal", onSteal);
    return () => window.removeEventListener("topgames:steal", onSteal);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          name,
          bidDollars: Number(bid),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong processing your bid.");
        return;
      }
      window.location.href = data.redirectUrl;
    } catch {
      setError("Could not connect. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const cta =
    preview && !previewError
      ? `Take #${preview.rank} — ${formatMoney(Math.round(bid) * 100)}`
      : "Outbid ↗";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8"
    >
      {stealHint && (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {stealHint}
        </p>
      )}

      {/* Paso 1 · Tu juego */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
          1 · Your game
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
            Game URL
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://store.steampowered.com/app/..."
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-emerald-500"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
            Name (optional)
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Game name"
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-emerald-500"
            />
          </label>
        </div>
        <SitePreview url={url} name={name} />
      </div>

      {/* Paso 2 · Tu puja */}
      <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950/50 px-6 py-6">
        <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
          2 · Your bid
        </p>
        <BidStepper
          value={bid}
          onChange={setBid}
          min={MIN_BID}
          max={MAX_BID}
        />
        <p className="text-center text-xs text-neutral-500">
          Minimum €5. Paying less than the #1 still puts you on the board.
        </p>
      </div>

      {/* Live preview de posición */}
      <div className="flex flex-col gap-3">
        <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
          Where you&apos;ll land
        </p>
        {isHttpUrl(url.trim()) && bid >= MIN_BID ? (
          <RankPreview preview={previewError ? null : (preview ?? null)} bidCents={Math.round(bid) * 100} />
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm text-neutral-600">
            Pick a game URL and your bid to see the board preview.
          </div>
        )}
      </div>

      {error && <p className="text-center text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-base font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            Processing…
          </>
        ) : (
          cta
        )}
      </button>
    </form>
  );
}