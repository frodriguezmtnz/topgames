import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rawgProvider } from "@/lib/games/rawg";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (
    !(await rateLimit(clientIp(req), {
      prefix: "search",
      max: 30,
      windowSeconds: 60,
    }))
  ) {
    return NextResponse.json(
      { error: "Too many requests. Slow down." },
      { status: 429 },
    );
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }
  if (q.length > 100) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  // 1) Buscar en la DB local primero (no golpear RAWG si ya esta importado).
  const local = await prisma.game.findMany({
    where: {
      status: "active",
      name: { contains: q, mode: "insensitive" },
    },
    orderBy: { voteCount: "desc" },
    take: 12,
  });

  if (local.length > 0) {
    return NextResponse.json({
      results: local.map((g) => ({
        imported: true,
        id: g.id,
        slug: g.slug,
        name: g.name,
        coverUrl: g.coverUrl,
        releasedAt: g.releasedAt,
        genres: g.genres,
        platforms: g.platforms,
      })),
    });
  }

  // 2) No en local → consultar RAWG SIN persistir. Se importa bajo demanda al
  //    abrir /games/:slug?rawg=<id> (evita polucionar la DB con 12 juegos por busqueda).
  const games = await rawgProvider.searchGames(q);

  return NextResponse.json({
    results: games.map((g) => ({
      imported: false,
      rawgId: g.providerGameId,
      slug: g.slug ?? generateSlug(g.name),
      name: g.name,
      coverUrl: g.coverUrl ?? null,
      releasedAt: g.releasedAt ?? null,
      genres: g.genres ?? [],
      platforms: g.platforms ?? [],
    })),
  });
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
