import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeToggle from "@/components/ThemeToggle";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950 text-neutral-100">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pt-6 text-sm">
          <Link href="/" className="font-semibold text-neutral-200 hover:text-neutral-100">
            topvideogames<span className="text-emerald-500">.</span>lol
          </Link>
          <nav className="flex items-center gap-5 text-neutral-400">
            <Link href="/rules" className="transition hover:text-neutral-200">
              Rules
            </Link>
            <Link href="/about" className="transition hover:text-neutral-200">
              About
            </Link>
            <ThemeToggle />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}