import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { game: true },
  });

  const activity = payments.map((p) => ({
    gameId: p.gameId,
    gameName: p.game.name,
    gameUrl: p.game.url,
    kind: p.kind,
    amountCents: p.amountCents,
    createdAt: p.createdAt.toISOString(),
  }));

  return NextResponse.json({ activity });
}