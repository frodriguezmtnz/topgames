"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VoteButton({ gameId, initialCount }: { gameId: string; initialCount: number }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; emailVerified: boolean } | null | undefined>(undefined);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/games/${gameId}/vote-status`).then((r) => r.json()),
    ])
      .then(([me, status]) => {
        if (!alive) return;
        setUser(me.user ?? null);
        setVoted(Boolean(status.voted));
      })
      .catch(() => {
        if (alive) setUser(null);
      });
    return () => {
      alive = false;
    };
  }, [gameId]);

  const onVote = useCallback(async () => {
    if (loading) return;
    setError(null);

    if (!user) {
      router.push("/login?next=/games/" + gameId);
      return;
    }
    if (!user.emailVerified) {
      setError("Verify your email before voting.");
      return;
    }
    if (voted) {
      setError("You already voted for this game.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/games/${gameId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 401) {
        router.push("/login?next=/games/" + gameId);
        return;
      }
      if (res.status === 403) {
        setError("Verify your email before voting.");
        return;
      }
      if (res.status === 409) {
        setError("You already voted for this game.");
        setVoted(true);
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Try again.");
        return;
      }
      setVoted(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [gameId, user, voted, loading, router]);

  if (user === undefined) {
    return (
      <button
        disabled
        className="rounded-lg bg-emerald-500/60 px-6 py-3 text-sm font-bold text-neutral-950"
      >
        Loading…
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onVote}
        disabled={loading || voted}
        className={`rounded-lg px-6 py-3 text-sm font-bold transition hover:bg-emerald-400 ${
          voted
            ? "cursor-default bg-emerald-500/30 text-emerald-200"
            : "bg-emerald-500 text-neutral-950"
        }`}
      >
        {voted
          ? `❤️ Voted (${initialCount.toLocaleString("en-US")} votes)`
          : loading
            ? "Voting…"
            : "❤️ Vote for this game"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}