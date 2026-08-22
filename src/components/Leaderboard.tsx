"use client";

import useSWR from "swr";
import { formatMoney, hostnameOf } from "@/lib/format";

type GameRow = {
  rank: number;
  key: string;
  name: string;
  url: string;
  coverUrl: string | null;
  description: string | null;
  bidCents: number;
  clicks: number;
  claimCents: number;
};

type BoardResponse = {
  count: number;
  topCents: number;
  games: GameRow[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const rankColor = (rank: number) =>
  rank === 1
    ? "text-emerald-400"
    : rank === 2
      ? "text-zinc-400"
      : rank === 3
        ? "text-orange-500"
        : "text-neutral-500";

const rowClass = (rank: number) =>
  rank === 1
    ? "border-emerald-500/70 bg-neutral-900/70 shadow-[0_0_18px_rgba(16,185,129,0.25)]"
    : "border-neutral-800 bg-neutral-900/50";

function steal(g: GameRow) {
  window.dispatchEvent(
    new CustomEvent("topgames:steal", {
      detail: {
        url: g.url,
        name: g.name,
        bidDollars: g.claimCents / 100,
        rank: g.rank,
      },
    }),
  );
}

export default function Leaderboard() {
  const { data, error } = useSWR<BoardResponse>("/api/board", fetcher, {
    refreshInterval: 10_000,
  });

  if (error) return <p className="text-sm text-neutral-500">Could not load the ranking.</p>;
  if (!data) return <p className="text-sm text-neutral-500">Loading ranking…</p>;

  return (
    <div className="flex flex-col gap-3">
      {data.games.map((g) => (
        <div
          key={g.rank}
          className={`flex items-center gap-4 rounded-xl border p-4 ${rowClass(g.rank)}`}
        >
          <span className={`w-8 text-center text-lg font-bold ${rankColor(g.rank)}`}>
            {g.rank === 1 ? "👑" : g.rank}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-medium text-neutral-100">{g.name}</h3>
              <a
                href={`/api/r/${encodeURIComponent(g.key)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs text-neutral-500 hover:text-neutral-300"
              >
                {hostnameOf(g.url)}
              </a>
            </div>
            {g.description && (
              <p className="mt-0.5 truncate text-sm text-neutral-500">{g.description}</p>
            )}
            <p className="mt-0.5 text-xs text-neutral-600">
              {g.clicks.toLocaleString()} visits
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-sm font-semibold text-neutral-100">
              {formatMoney(g.bidCents)}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => steal(g)}
                className="rounded-full border border-emerald-500/60 px-3 py-1 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10"
              >
                Steal spot
              </button>
              <a
                href={`/api/r/${encodeURIComponent(g.key)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:border-neutral-400"
              >
                Play
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}