import { NextResponse } from "next/server";
import { MAX_BID_CENTS, MIN_BID_CENTS } from "@/lib/gaming/constants";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const games = await prisma.game.findMany({
    where: { bidCents: { gte: MIN_BID_CENTS, lte: MAX_BID_CENTS } },
    orderBy: [{ bidCents: "desc" }, { createdAt: "asc" }],
  });

  const rows = games.map((g, i) => ({
    rank: i + 1,
    name: g.name,
    url: g.url,
    coverUrl: g.coverUrl,
    description: g.description,
    bidCents: g.bidCents,
    clicks: g.clicks,
    claimCents: i === 0 ? g.bidCents + 500 : g.bidCents + 100,
  }));

  return NextResponse.json({
    count: rows.length,
    topCents: rows[0]?.bidCents ?? 0,
    games: rows,
  });
}