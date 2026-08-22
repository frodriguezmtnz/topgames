import Link from "next/link";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <nav className="text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-200">topvideogames.lol</Link>
        <span className="mx-2 text-neutral-700">·</span>
        <Link href="/about" className="hover:text-neutral-200">About</Link>
      </nav>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-neutral-400">
          Last updated: August 2026. This site is run as an independent, ad-free
          leaderboard. This policy explains what data is collected and why.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Data you submit
          </h2>
          <p className="text-neutral-400">
            When you list a game you provide its name, URL, and optionally a
            description and cover image. Those become part of the public leaderboard.
            There is no account system: we never ask for a name, email address or
            password.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Data collected automatically
          </h2>
          <ul className="list-inside list-disc space-y-2 text-neutral-400">
            <li>
              <span className="text-neutral-300">IP address</span> — used only to
              rate-limit bids and to block malicious traffic. It is not stored, not
              sold and not linked to a profile.
            </li>
            <li>
              <span className="text-neutral-300">Theme preference</span> — saved in
              your browser&apos;s localStorage so the theme toggle remembers your choice.
              This never leaves your device.
            </li>
            <li>
              <span className="text-neutral-300">Aggregate traffic data</span> — via
              Vercel Analytics, without personal identifiers.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Payments
          </h2>
          <p className="text-neutral-400">
            Payments are processed by <span className="text-neutral-300">Lemon Squeezy</span>,
            our merchant of record. We never see or store your card details. When you
            check out you may share data with Lemon Squeezy under its own privacy
            policy.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Service providers
          </h2>
          <p className="text-neutral-400">
            This site runs on <span className="text-neutral-300">Vercel</span>{" "}
            (hosting, edge network and analytics), stores data in{" "}
            <span className="text-neutral-300">Neon</span> (PostgreSQL), uses{" "}
            <span className="text-neutral-300">Upstash</span> (Redis) for rate-limiting,
            and <span className="text-neutral-300">Lemon Squeezy</span> for payments.
            These providers process data only to operate this service.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Cookies
          </h2>
          <p className="text-neutral-400">
            We do not use advertising or tracking cookies. The only browser storage in
            use is localStorage for the theme preference. Vercel Analytics uses
            privacy-friendly, cookieless measurement.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Your rights
          </h2>
          <p className="text-neutral-400">
            If you listed a game, you can request removal by writing to the contact
            address in the Terms of Service. We&apos;ll remove your entry from the
            leaderboard within a reasonable time.
          </p>
        </div>
      </section>

      <footer className="text-xs text-neutral-600">
        <Link href="/" className="hover:text-neutral-300">← back to the ranking</Link>
        {" · "}
        <Link href="/terms" className="hover:text-neutral-300">Terms of Service</Link>
      </footer>
    </main>
  );
}