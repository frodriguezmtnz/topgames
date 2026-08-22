"use client";

import { useState } from "react";

export default function BidForm() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [bid, setBid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
          Game URL
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://store.steampowered.com/app/..."
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-400"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
          Name (optional)
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Game name"
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-400"
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
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-400"
        />
        <span className="text-xs text-neutral-500">
          Minimum $5. Paying less than the #1 still puts you on the board.
        </span>
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processing…" : "Outbid ↗"}
      </button>
    </form>
  );
}