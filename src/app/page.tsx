import Link from "next/link";
import ActivityFeed from "@/components/ActivityFeed";
import BidForm from "@/components/BidForm";
import Leaderboard from "@/components/Leaderboard";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const metadata = {
  title: "topvideogames.lol — the game ranking where your bid decides it",
  description:
    "Games are ranked by how much creators are willing to bet on their own game. No juries. No algorithms.",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [gamesCount, bidToday, clicksTotal] = await Promise.all([
    prisma.game.count(),
    prisma.payment.aggregate({
      _sum: { amountCents: true },
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.game.aggregate({ _sum: { clicks: true } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-10">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-neutral-500">
        <span>
          <span className="font-semibold text-neutral-300">{gamesCount}</span> games online
        </span>
        <span>·</span>
        <span>
          <span className="font-semibold text-neutral-300">
            {formatMoney(bidToday._sum.amountCents ?? 0)}
          </span>{" "}
          bid today
        </span>
        <span>·</span>
        <span>
          <span className="font-semibold text-neutral-300">{clicksTotal._sum.clicks ?? 0}</span>{" "}
          clicks sent
        </span>
      </div>

      {/* Hero */}
      <section className="text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-black tracking-tight text-neutral-50">
          Think your game deserves the #1 spot?{" "}
          <span className="text-emerald-500">Prove it.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-400">
          Games are ranked by how much creators are willing to put behind their own
          game. No juries. No algorithms. Just a bid.
        </p>
        <p className="mt-4 inline-block rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-1 text-xs text-neutral-500">
          New listings start at $5. Paying less than the top still puts you on the
          board — right where your bid can buy.
        </p>
      </section>

      <section className="text-center">
        <BidForm />
        <p className="mt-3 text-xs text-neutral-500">
          Already in the ranking? Use the same URL to raise your bid.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-neutral-200">Leaderboard</h2>
          <span className="text-xs text-neutral-500">refreshes automatically</span>
        </div>
        <Leaderboard />
      </section>

      <ActivityFeed />

      <footer className="mt-8 flex flex-wrap flex-col items-center justify-center gap-2 border-t border-neutral-800 pt-6 text-center text-xs text-neutral-500">
        <p>
          Rankings here don&apos;t use judges. Ours use bids. · topvideogames.lol — the
          least objective game ranking on the internet. Inspired by{" "}
          <a
            href="https://outbid.lol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-neutral-200"
          >
            outbid.lol
          </a>
        </p>
        <div className="flex gap-x-5">
          <Link href="/rules" className="hover:text-neutral-300">Rules</Link>
          <Link href="/about" className="hover:text-neutral-300">About</Link>
        </div>
      </footer>
    </main>
  );
}