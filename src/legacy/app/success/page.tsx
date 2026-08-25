import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifySuccessToken } from "@/lib/pay/successToken";

export const metadata = { title: "Payment received" };

export const dynamic = "force-dynamic";

// /success solo se muestra si:
//  1) el token de exito es valido (firmado por el servidor al crear el checkout), y
//  2) existe un Payment reciente para ese juego (lo crea el webhook al confirmar el pago).
// Si no, redirige a la home. Impide "falsos pagos" visitando la URL directamente.
export default async function SuccessPage(props: {
  searchParams: Promise<{ key?: string; t?: string; mocked?: string }>;
}) {
  const { key, t, mocked } = await props.searchParams;
  if (!key || !verifySuccessToken(t, key)) {
    redirect("/");
  }

  let rank: number | null = null;
  let gameName: string | null = null;
  try {
    const game = await prisma.game.findUnique({ where: { key } });
    const recent = await prisma.payment.findFirst({
      where: {
        gameId: game?.id,
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });
    if (recent && game) {
      gameName = game.name;
      const games = await prisma.game.findMany({
        orderBy: [{ bidCents: "desc" }, { createdAt: "asc" }],
      });
      const idx = games.findIndex((g) => g.key === key);
      if (idx !== -1) rank = idx + 1;
    }
  } catch {
    // si la BD no esta disponible no rompemos la pagina
  }

  if (!gameName) {
    // Pago test/real procesandose: no mostramos exito hasta confirmar por webhook.
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">Processing your payment…</h1>
        <p className="text-sm text-neutral-500">
          We&apos;re confirming your bid. Give it a moment and refresh.
        </p>
        <Link
          href="/"
          className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm"
        >
          Back to the ranking
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Payment received</h1>
      {rank ? <p className="text-5xl font-black text-emerald-400">#{rank}</p> : null}
      <p className="text-sm text-neutral-500">
        {gameName} is on the leaderboard.
        {rank ? ` It ranks #${rank}.` : ""}
      </p>
      {mocked === "1" && (
        <p className="text-xs text-amber-500">
          (demo mode: simulated payment, no charge)
        </p>
      )}
      <Link
        href="/"
        className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm"
      >
        View the ranking
      </Link>
    </main>
  );
}