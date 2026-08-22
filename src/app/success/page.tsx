import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Pago completado" };

export const dynamic = "force-dynamic";

export default async function SuccessPage(props: {
  searchParams: Promise<{ key?: string; mocked?: string }>;
}) {
  const { key, mocked } = await props.searchParams;

  let rank: number | null = null;
  if (key) {
    try {
      const games = await prisma.game.findMany({
        orderBy: [{ bidCents: "desc" }, { createdAt: "asc" }],
      });
      const idx = games.findIndex((g) => g.key === key);
      if (idx !== -1) rank = idx + 1;
    } catch {
      // si la BD no esta disponible no rompemos la pagina
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Pago recibido</h1>
      {rank ? (
        <p className="text-5xl font-black text-emerald-400">#{rank}</p>
      ) : null}
      <p className="text-sm text-neutral-500">
        Tu juego ya está en el ranking.
        {rank ? ` Está en el puesto #${rank}.` : ""}
      </p>
      {mocked === "1" && (
        <p className="text-xs text-amber-500">
          (modo demo: sin cargo real, pago simulado en local)
        </p>
      )}
      <Link
        href="/"
        className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm"
      >
        Ver ranking
      </Link>
    </main>
  );
}