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
    ? "relative z-10 scale-[1.02] border-emerald-400/80 bg-neutral-900/70 p-5 shadow-[0_0_24px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400/50 sm:scale-[1.04]"
    : "border-neutral-800 bg-neutral-900/50 p-4";

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
        <div key={g.rank} className={`flex items-center gap-4 rounded-xl border ${rowClass(g.rank)}`}>
          {g.rank === 1 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 animate-ping rounded-xl border-2 border-emerald-400/60"
            />
          )}
          <span className={`w-8 text-center font-bold ${rankColor(g.rank)} ${g.rank === 1 ? "text-2xl" : "text-lg"}`}>
            {g.rank === 1 ? "👑" : g.rank}
          </span>
          {g.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={g.coverUrl}
              alt={g.name}
              width={64}
              height={48}
              className={`shrink-0 rounded object-cover ${g.rank === 1 ? "h-12 w-16" : "h-10 w-14"}`}
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`truncate text-neutral-100 ${g.rank === 1 ? "text-lg font-semibold" : "font-medium"}`}>
                {g.name}
              </h3>
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
            <span className={`font-semibold text-neutral-100 ${g.rank === 1 ? "text-xl" : "text-sm"}`}>
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