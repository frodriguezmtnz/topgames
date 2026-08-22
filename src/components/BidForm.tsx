"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/format";

type StealPayload = {
  url: string;
  name: string;
  bidDollars: number;
  rank: number;
};

export default function BidForm() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [bid, setBid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stealHint, setStealHint] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onSteal = (e: Event) => {
      const d = (e as CustomEvent<StealPayload>).detail;
      setUrl(d.url);
      setName(d.name);
      setBid(String(d.bidDollars));
      setStealHint(`Taking the #${d.rank} spot. Bid is ready — just press Outbid.`);
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

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6"
    >
      {stealHint && (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {stealHint}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
        Your bid (USD)
        <input
          type="number"
          min={5}
          max={999999}
          step={1}
          required
          value={bid}
          onChange={(e) => setBid(e.target.value)}
          placeholder="100"
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-emerald-500"
        />
        <span className="text-xs text-neutral-500">
          Minimum $5. Paying less than the #1 still puts you on the board.
        </span>
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            Processing…
          </>
        ) : (
          "Outbid ↗"
        )}
      </button>
      {bid && Number.isFinite(Number(bid)) && (
        <p className="text-center text-xs text-neutral-500">
          You&apos;ll pay{" "}
          <span className="font-semibold text-emerald-400">
            {formatMoney(Number(bid) * 100)}
          </span>{" "}
          to push this game onto the board.
        </p>
      )}
    </form>
  );
}