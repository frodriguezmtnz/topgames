import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import { getSessionUser } from "@/lib/auth/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://topvideogames.lol"),
  title: {
    default: "topvideogames.lol — the game ranking where your bid decides it",
    template: "%s · topvideogames.lol",
  },
  description:
    "Games are ranked by how much creators are willing to bet on their own game. No juries. No algorithms. Just bid.",
  openGraph: {
    type: "website",
    siteName: "topvideogames.lol",
    title: "topvideogames.lol — the game ranking where your bid decides it",
    description:
      "Games are ranked by how much creators are willing to bet on their own game.",
  },
  twitter: {
    card: "summary_large_image",
    title: "topvideogames.lol — the game ranking where your bid decides it",
    description:
      "Bid to put your game at the top. No juries. No algorithms. Just bid.",
  },
  robots: { index: true, follow: true },
};

const themeScript = `(function(){try{var t=localStorage.getItem('topgames-theme');var light=t?t==='light':window.matchMedia('(prefers-color-scheme: light)').matches;document.documentElement.dataset.theme=light?'light':'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950 text-neutral-100">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pt-6 text-sm">
          <Link href="/" className="flex items-center gap-1.5 font-semibold text-neutral-200 hover:text-neutral-100">
            <svg
              width="18"
              height="18"
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect width="64" height="64" rx="14" fill="#0a0a0a" />
              <rect x="8" y="20" width="48" height="26" rx="13" fill="#171717" stroke="#34d399" strokeWidth="3" />
              <path d="M20 28v8M16 32h8" stroke="#fafafa" strokeWidth="3" strokeLinecap="round" />
              <circle cx="42" cy="30" r="2.2" fill="#fafafa" />
              <circle cx="48" cy="34" r="2.2" fill="#fafafa" />
            </svg>
            topvideogames<span className="text-emerald-500">.</span>lol
          </Link>
          <nav className="flex items-center gap-5 text-neutral-400">
            <Link href="/rules" className="transition hover:text-neutral-200">
              Rules
            </Link>
            <Link href="/about" className="transition hover:text-neutral-200">
              About
            </Link>
            {user ? (
              <>
                <span className="hidden text-sm sm:inline" title={user.email}>
                  {user.email}
                </span>
                <LogoutButton />
              </>
            ) : (
              <Link href="/login" className="transition hover:text-neutral-200">
                Log in
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </header>
        {children}
        <footer className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-8 text-xs text-neutral-600">
          <span>© {new Date().getFullYear()} topvideogames.lol</span>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="transition hover:text-neutral-300">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-neutral-300">
              Terms
            </Link>
          </nav>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}