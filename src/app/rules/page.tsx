import Link from "next/link";

export const metadata = { title: "Rules" };

export default function RulesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <nav className="text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-200">topvideogames.lol</Link>
        <span className="mx-2 text-neutral-700">·</span>
        <Link href="/about" className="hover:text-neutral-200">About</Link>
      </nav>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rules</h1>
        <p className="mt-2 text-neutral-400">
          topvideogames.lol is a public leaderboard. No ads, no API keys, no revenue
          share. You pay to rank above others. Your bid is your rank — nothing else.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            How the ranking works
          </h2>
          <ul className="list-inside list-disc space-y-2 text-neutral-400">
            <li>
              New listings use whole euros, minimum €5, maximum €999,999. Existing
              bids keep their amount until they raise it or get outbid.
            </li>
            <li>
              Taking the #1 spot costs at least €5 more than the current top bid.
              Paying less still places you on the board at whatever spot your bid can
              buy.
            </li>
            <li>
              Tied bids are ordered by age: the older bid ranks higher.
            </li>
            <li>
              Listing the same URL again lets you raise your bid — you only pay the
              difference, and nobody can take your spot by paying that same difference.
            </li>
            <li>
              Steam, itch.io and similar links are identified by their path, so
              different games never share a bid. Tracking query params are ignored.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            What you can list
          </h2>
          <ul className="list-inside list-disc space-y-2 text-neutral-400">
            <li>A game on Steam, Game Pass, itch.io, your own site or any game page.</li>
            <li>
              Invite links to chats are not allowed — Discord, WhatsApp, Telegram, etc.
            </li>
            <li>
              No sexually explicit content. If it&apos;s porn or an adult platform, it
              doesn&apos;t make the board.
            </li>
            <li>Query params are stripped from listed links.</li>
            <li>URL shorteners are not allowed; they get replaced by their final destination.</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            After you pay
          </h2>
          <ul className="list-inside list-disc space-y-2 text-neutral-400">
            <li>
              Your game is public and clicks go to the URL you submitted, stripped of
              query params.
            </li>
            <li>A completed payment is what claims the spot.</li>
          </ul>
        </div>
      </section>

      <footer className="text-xs text-neutral-600">
        <Link href="/" className="hover:text-neutral-300">← back to the ranking</Link>
      </footer>
    </main>
  );
}