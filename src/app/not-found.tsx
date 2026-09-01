import Link from "next/link";
import NotFoundMessage from "@/components/NotFoundMessage";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-5 py-16 text-center">
      <NotFoundMessage />
      <h1 className="text-6xl font-black tracking-tight text-neutral-50 sm:text-7xl">
        4<span className="text-emerald-500">0</span>4
      </h1>
      <p className="max-w-md text-neutral-400">
        The game you&apos;re looking for doesn&apos;t exist yet — but the
        ranking is full of real ones.
      </p>
      <Link
        href="/"
        className="rounded-lg border border-neutral-800 px-5 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-emerald-600 hover:text-emerald-300"
      >
        ← Back to ranking
      </Link>
    </main>
  );
}