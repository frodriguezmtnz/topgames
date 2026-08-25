"use client";

import { formatMoney } from "@/lib/format";

export type RankPreviewData = {
  rank: number;
  count: number;
  topCents: number;
  toTopCents: number;
  existing: boolean;
  takeTop: boolean;
};

export default function RankPreview({
  preview,
  bidCents,
}: {
  preview: RankPreviewData | null;
  bidCents: number;
}) {
  if (!preview) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 px-4 py-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500/70" />
        <span className="text-sm text-neutral-500">Checking the board…</span>
      </div>
    );
  }

  const bid = formatMoney(bidCents);

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm text-neutral-300">
      {preview.takeTop ? (
        <p>
          Your <span className="font-semibold text-emerald-400">{bid}</span> takes the{" "}
          <span className="font-bold text-emerald-400">#1 spot</span>
          {preview.count > 0 ? " on the board" : ""}. 🏆
        </p>
      ) : preview.count === 0 ? (
        <p>
          Your <span className="font-semibold text-emerald-400">{bid}</span> puts the{" "}
          <span className="font-bold text-emerald-400">first entry</span> on the board. 🚀
        </p>
      ) : (
        <p>
          {bid} lands you at <span className="font-bold text-neutral-100">#{preview.rank}</span>
          {" · "}
          <span className="font-semibold text-emerald-400">
            {formatMoney(preview.toTopCents)}
          </span>{" "}
          takes the top spot.
        </p>
      )}
    </div>
  );
}