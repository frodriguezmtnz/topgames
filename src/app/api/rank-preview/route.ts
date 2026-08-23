import { NextRequest, NextResponse } from "next/server";
import { MAX_BID_CENTS, MIN_BID_CENTS, OUTBID_STEP_CENTS } from "@/lib/gaming/constants";
import { prisma } from "@/lib/db";
import { isValidHttps, safeKeyForUrl } from "@/lib/gaming/urls";

export const dynamic = "force-dynamic";

/**
 * Preview de ranking para la UI: dado un url y una puja en centimos, calcula
 * en que posicion del board caeria esa puja (como si fuera nueva, o como raise
 * si el juego ya esta en el board). Mismo criterio de orden que /api/board:
 * bidCents desc, createdAt asc (empates se desempatan por antiguedad).
 */
export async function GET(req: NextRequest) {
  const url = (req.nextUrl.searchParams.get("url") ?? "").trim();
  const bidCents = Number(req.nextUrl.searchParams.get("bidCents"));
  const key = safeKeyForUrl(url);

  if (!url || !isValidHttps(url) || !key) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  if (!Number.isInteger(bidCents) || bidCents < MIN_BID_CENTS || bidCents > MAX_BID_CENTS) {
    return NextResponse.json({ error: "invalid bid" }, { status: 400 });
  }

  const rows = await prisma.game.findMany({
    where: { bidCents: { gte: MIN_BID_CENTS, lte: MAX_BID_CENTS } },
    orderBy: [{ bidCents: "desc" }, { createdAt: "asc" }],
  });

  const self = rows.find((g) => g.key === key) ?? null;
  const others = self ? rows.filter((g) => g.key !== key) : rows;

  // La puja final nunca baja: si el juego ya tiene bid, se sube desde ahi.
  const proposed = self ? Math.max(self.bidCents, bidCents) : bidCents;
  const hypotheticalCreated = self ? self.createdAt : new Date();

  let rank = 1;
  for (const g of others) {
    if (g.bidCents > proposed) {
      rank++;
    } else if (g.bidCents === proposed && g.createdAt <= hypotheticalCreated) {
      // Empate: el que se creo antes queda delante (mismo criterio que el board).
      rank++;
    }
  }

  const topCents = rows[0]?.bidCents ?? 0;
  const toTopCents = topCents + OUTBID_STEP_CENTS;

  return NextResponse.json({
    rank,
    count: rows.length,
    topCents,
    toTopCents,
    existing: Boolean(self),
    takeTop: rank === 1,
  });
}