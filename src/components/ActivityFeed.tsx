"use client";

import useSWR from "swr";
import { formatMoney, hostnameOf, timeAgo } from "@/lib/format";

type ActivityItem = {
  gameName: string;
  gameUrl: string;
  kind: "new" | "raise";
  amountCents: number;
  createdAt: string;
};

type ActivityResponse = { activity: ActivityItem[] };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ActivityFeed() {
  const { data, error } = useSWR<ActivityResponse>("/api/activity", fetcher, {
    refreshInterval: 15_000,
  });

  if (error) return null;
  if (!data || data.activity.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h2 className="mb-3 text-lg font-semibold text-neutral-200">Recent activity</h2>
      <div className="flex flex-col gap-2">
        {data.activity.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-sm"
          >
            <span className="font-medium text-neutral-200">{a.gameName}</span>
            <span className="text-neutral-600">{hostnameOf(a.gameUrl)}</span>
            <span className="ml-auto text-xs text-neutral-500">
              {a.kind === "raise" ? "↑" : "+"} {formatMoney(a.amountCents)} ·{" "}
              {timeAgo(a.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}