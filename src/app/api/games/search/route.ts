import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rawgProvider } from "@/lib/games/rawg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }
  if (q.length > 100) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  // 1) Buscar en la DB local primero (no golpear RAWG en cada busqueda repetida).
  const local = await prisma.game.findMany({
    where: {
      status: "active",
      name: { contains: q, mode: "insensitive" },
    },
    orderBy: { voteCount: "desc" },
    take: 12,
  });

  if (local.length > 0) {
    return NextResponse.json({ results: local });
  }

  // 2) No en local → consultar RAWG, persistir y devolver.
  const games = await rawgProvider.searchGames(q);
  const persisted = await Promise.all(
    games.map(async (g) => {
      return prisma.game.upsert({
        where: {
          provider_providerGameId: { provider: "rawg", providerGameId: g.providerGameId },
        },
        update: {
          name: g.name,
          coverUrl: g.coverUrl,
          releasedAt: g.releasedAt,
          genres: g.genres ?? [],
          platforms: g.platforms ?? [],
        },
        create: {
          provider: g.provider,
          providerGameId: g.providerGameId,
          name: g.name,
          slug: g.slug ?? generateSlug(g.name),
          coverUrl: g.coverUrl,
          backgroundUrl: g.backgroundUrl,
          releasedAt: g.releasedAt,
          description: g.description,
          websiteUrl: g.websiteUrl,
          genres: g.genres ?? [],
          platforms: g.platforms ?? [],
        },
      });
    }),
  );

  return NextResponse.json({ results: persisted });
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
