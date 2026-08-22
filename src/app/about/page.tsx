import Link from "next/link";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <nav className="text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-200">topvideogames.lol</Link>
        <span className="mx-2 text-neutral-700">·</span>
        <Link href="/rules" className="hover:text-neutral-200">Rules</Link>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">About</h1>

      <p className="text-neutral-300">
        topvideogames.lol started as a side project: no ads, no API keys, no revenue
        share. Just bidding to outrank the competition and be the #1 — that&apos;s it.
      </p>

      <p className="text-neutral-400">
        Every row in the leaderboard is a game. You can bid on your own game (Steam,
        itch.io, your website — anything) or on any game you want to see higher.
        The more you pay, the higher it ranks. The ranking is the bid, nothing else.
      </p>

      <p className="text-neutral-400">
        The project stays alive under the same rules. Same board, same idea.
        Your bid is your rank — nothing else.
      </p>

      <footer className="mt-6 text-xs text-neutral-600">
        Built as a playful leaderboard for gamers &amp; indie devs. ·{" "}
        <Link href="/rules" className="hover:text-neutral-300">see the rules</Link>
      </footer>
    </main>
  );
}