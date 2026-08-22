import Link from "next/link";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <nav className="text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-200">topvideogames.lol</Link>
        <span className="mx-2 text-neutral-700">·</span>
        <Link href="/about" className="hover:text-neutral-200">About</Link>
      </nav>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-neutral-400">
          Last updated: August 2026. By using topvideogames.lol you agree to these
          terms.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            What the ranking is
          </h2>
          <p className="text-neutral-400">
            The leaderboard is a public ranking. A bid claims a spot for the listed
            game, and paying more places it higher. The ranking is the bid — nothing
            else, and no revenue is shared with anyone.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Payments and refunds
          </h2>
          <p className="text-neutral-400">
            Payments are processed and collected by Lemon Squeezy (a merchant of
            record). Bids are used to keep the service running and, by design, do not
            purchase a lasting asset. Refunds are only issued if a payment was applied
            in error or a listed entry is removed at our initiative. To request a
            refund, contact the address below with your order number.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            What you may not list
          </h2>
          <ul className="list-inside list-disc space-y-2 text-neutral-400">
            <li>Invite links to chats (Discord, WhatsApp, Telegram, and similar).</li>
            <li>Sexually explicit content or adult platforms.</li>
            <li>URL shorteners; they get replaced by their final destination.</li>
            <li>Anything illegal, or content you do not have the right to promote.</li>
          </ul>
          <p className="mt-2 text-neutral-400">
            We may remove any entry that violates these terms or the rules page,
            without a refund, and reserve the right to block the network behind it
            from placing bids.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Acceptable use
          </h2>
          <p className="text-neutral-400">
            Do not attempt to manipulate the board through automation, do not flood
            the API, and do not use the site to distribute malware or phishing. The
            site applies rate limits and blocks abusive traffic.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Third-party links
          </h2>
          <p className="text-neutral-400">
            The leaderboard links out to third-party game pages. We are not
            responsible for their content. Clicking a listed URL opens the external
            site directly.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Service availability
          </h2>
          <p className="text-neutral-400">
            The service is provided &quot;as is&quot; without warranties of any kind. To the
            maximum extent permitted by law, the operator is not liable for
            indirect, incidental or consequential damages arising from its use.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">Contact</h2>
          <p className="text-neutral-400">
            For removal requests, refunds or any question, you can reach the operator
            through the GitHub repository{" "}
            <a
              href="https://github.com/frodriguezmtnz/topgames"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 underline decoration-neutral-600 hover:decoration-neutral-300"
            >
              frodriguezmtnz/topgames
            </a>
            .
          </p>
        </div>
      </section>

      <footer className="text-xs text-neutral-600">
        <Link href="/" className="hover:text-neutral-300">← back to the ranking</Link>
        {" · "}
        <Link href="/privacy" className="hover:text-neutral-300">Privacy Policy</Link>
      </footer>
    </main>
  );
}