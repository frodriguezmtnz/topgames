"use client";

import useSWR from "swr";
import { formatMoney, hostnameOf } from "@/lib/format";

type GameRow = {
  rank: number;
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
    ? "text-amber-300"
    : rank === 2
      ? "text-zinc-300"
      : rank === 3
        ? "text-orange-300"
        : "text-neutral-500";

export default function Leaderboard() {
  const { data, error } = useSWR<BoardResponse>("/api/board", fetcher, {
    refreshInterval: 10_000,
  });

  if (error) return <p className="text-sm text-neutral-500">No se pudo cargar el ranking.</p>;
  if (!data) return <p className="text-sm text-neutral-500">Cargando ranking…</p>;

  return (
    <div className="flex flex-col gap-3">
      {data.games.map((g) => (
        <div
          key={g.rank}
          className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4"
        >
          <span className={`w-8 text-center text-lg font-bold ${rankColor(g.rank)}`}>
            {g.rank}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-medium text-neutral-100">{g.name}</h3>
              <a
                href={g.url}
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
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                try {
                  const u = new URL(g.url);
                  u.searchParams.set("utm_source", "topgames");
                  window.open(u.toString(), "_blank");
                } catch {
                  window.open(g.url, "_blank");
                }
              }}
              className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:border-neutral-400"
            >
              Play
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}