import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { rawgProvider } from "@/lib/games/rawg";
import { formatNumber } from "@/lib/format";
import { providerInfo } from "@/lib/affiliate/providers";
import { rateLimit } from "@/lib/ratelimit";
import VoteButton from "@/components/VoteButton";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rawg?: string }>;
};

export const dynamic = "force-dynamic";

// Deduplicar imports de RAWG en vuelo: generateMetadata y Page pueden ejecutarse en
// paralelo en el primer hit, y no queremos 2 llamadas a RAWG ni colisiones al crear.
const importsInFlight = new Map<string, Promise<Awaited<ReturnType<typeof importFromRawg>> | null>>();

// Importar un juego de RAWG bajo demanda (primer click desde la busqueda).
// Se guarda con el slug de la URL para que sea estable. Devuelve null si RAWG falla.
async function importFromRawg(rawgId: string, requestedSlug: string) {
  const detail = await rawgProvider.getGame(rawgId);
  if (!detail) {
    return null;
  }

  let game = await prisma.game.findUnique({
    where: {
      provider_providerGameId: { provider: "rawg", providerGameId: rawgId },
    },
  });

  if (!game) {
    try {
      game = await prisma.game.create({
        data: {
          provider: detail.provider,
          providerGameId: detail.providerGameId,
          name: detail.name,
          slug: detail.slug ?? requestedSlug,
          coverUrl: detail.coverUrl,
          backgroundUrl: detail.backgroundUrl,
          releasedAt: detail.releasedAt,
          description: detail.description,
          websiteUrl: detail.websiteUrl,
          genres: detail.genres ?? [],
          platforms: detail.platforms ?? [],
        },
      });
    } catch {
      // Colision de slug (dos juegos RAWG con el mismo slug): recuperar el existente.
      game = await prisma.game.findUnique({ where: { slug: detail.slug ?? requestedSlug } });
    }
  }
  if (!game) {
    return null;
  }

  // Guardar las tiendas del juego (Where to buy).
  try {
    const stores = await rawgProvider.getStores!(rawgId);
    if (stores.length > 0) {
      await prisma.$transaction(
        stores.map((s) =>
          prisma.storeLink.upsert({
            where: { gameId_provider: { gameId: game!.id, provider: s.provider } },
            update: { url: s.url },
            create: { gameId: game!.id, provider: s.provider, url: s.url },
          }),
        ),
      );
    }
  } catch {
    // si falla el detalle de tiendas, servimos el juego igualmente
  }

  return game;
}

async function loadGame(slug: string, rawgId?: string) {
  let game = await prisma.game.findUnique({ where: { slug } });

  // Import bajo demanda: segun el plan, se persiste solo al abrir la ficha.
  // Con rate-limit: evita que un bot recorra ?rawg=1..N y agote la cuota de RAWG.
  if (!game && rawgId) {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown";
    const allowed = await rateLimit(ip, {
      prefix: "game-import",
      max: 20,
      windowSeconds: 60,
    });
    if (!allowed) {
      return null;
    }

    let pending = importsInFlight.get(rawgId);
    if (!pending) {
      pending = importFromRawg(rawgId, slug).catch(() => null);
      importsInFlight.set(rawgId, pending);
      void pending.finally(() => importsInFlight.delete(rawgId));
    }
    game = await pending;
  }
  if (!game || game.status !== "active") {
    return null;
  }

  if (game.provider === "rawg") {
    // Enriquecer el detalle una sola vez (si falta la descripcion) y rellenar
    // las tiendas si aun no hay 'Where to buy'. No se consulta RAWG en cada page view.
    const [storeLinks] = await Promise.all([
      prisma.storeLink.findMany({ where: { gameId: game.id } }),
    ]);

    const needsDetail = !game.description;
    const needsStores = storeLinks.length === 0;

    if (needsDetail || needsStores) {
      try {
        const detail = needsDetail
          ? await rawgProvider.getGame(game.providerGameId)
          : null;
        if (needsDetail && detail) {
          await prisma.game.update({
            where: { id: game.id },
            data: {
              description: detail.description ?? game.description,
              websiteUrl: detail.websiteUrl ?? game.websiteUrl,
              backgroundUrl: detail.backgroundUrl ?? game.backgroundUrl,
            },
          });
        }
        if (needsStores) {
          const stores =
            detail?.stores && detail.stores.length > 0
              ? detail.stores
              : await rawgProvider.getStores!(game.providerGameId);
          if (stores.length > 0) {
            await prisma.$transaction(
              stores.map((s) =>
                prisma.storeLink.upsert({
                  where: {
                    gameId_provider: { gameId: game.id, provider: s.provider },
                  },
                  update: { url: s.url },
                  create: { gameId: game.id, provider: s.provider, url: s.url },
                }),
              ),
            );
          }
        }
        return prisma.game.findUnique({ where: { id: game.id } });
      } catch {
        // si RAWG falla, servimos lo que tengamos en local
      }
    }
  }
  return game;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { rawg } = await searchParams;
  const game = await loadGame(slug, rawg);
  if (!game) {
    return { title: "Game not found" };
  }
  const rank = await rankOf(game.voteCount);
  return {
    title: `${game.name} — ${formatNumber(game.voteCount)} votes, ranked #${rank} worldwide`,
    description:
      game.description?.slice(0, 160) ??
      `Vote for ${game.name} on TopVideoGames — the world's community-driven game ranking.`,
    openGraph: {
      title: game.name,
      description: `#${rank} worldwide · ${formatNumber(game.voteCount)} votes`,
      images: game.coverUrl ? [{ url: game.coverUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: game.name,
      description: `#${rank} worldwide · ${formatNumber(game.voteCount)} votes`,
    },
  };
}

async function rankOf(voteCount: number): Promise<number> {
  const greater = await prisma.game.count({
    where: { status: "active", voteCount: { gt: voteCount } },
  });
  return greater + 1;
}

export default async function GamePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { rawg } = await searchParams;
  const game = await loadGame(slug, rawg);
  if (!game) {
    notFound();
  }

  const rank = await rankOf(game.voteCount);

  const [related, storeLinks] = await Promise.all([
    prisma.game.findMany({
      where: {
        status: "active",
        id: { not: game.id },
        genres: { hasSome: game.genres },
      },
      orderBy: { voteCount: "desc" },
      take: 6,
    }),
    prisma.storeLink.findMany({ where: { gameId: game.id } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← Back to ranking
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        {game.coverUrl && (
          <Image
            src={game.coverUrl}
            alt={game.name}
            width={200}
            height={280}
            className="shrink-0 rounded-lg object-cover"
            unoptimized
          />
        )}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-black text-neutral-50">{game.name}</h1>
          <p className="text-sm text-neutral-400">
            <span className="font-semibold text-emerald-500">#{rank} Worldwide</span> ·{" "}
            {formatNumber(game.voteCount)} votes
          </p>
          <p className="text-sm text-neutral-500">
            {game.releasedAt
              ? `Released ${game.releasedAt.toISOString().slice(0, 4)}`
              : "Release date unknown"}
          </p>
          <div className="flex flex-wrap gap-2">
            {game.genres.map((g) => (
              <span
                key={g}
                className="rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-xs text-neutral-400"
              >
                {g}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {game.platforms.map((p) => (
              <span
                key={p}
                className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-300"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <VoteButton gameId={game.id} initialCount={game.voteCount} />

      {storeLinks.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Where to buy
          </h2>
          <div className="flex flex-wrap gap-2">
            {storeLinks.map((s) => {
              const info = providerInfo(s.provider);
              return (
                <a
                  key={s.id}
                  href={`/out/${s.provider}/${game.slug}`}
                  rel="noopener noreferrer"
                  className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-emerald-600 hover:text-emerald-300"
                >
                  {info?.label ?? s.provider}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {game.description && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">About</h2>
          <p className="whitespace-pre-line text-neutral-400">{game.description}</p>
        </section>
      )}

      {game.websiteUrl && (
        <p className="text-sm text-neutral-500">
          Official website:{" "}
          <a
            href={game.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 underline hover:text-neutral-100"
          >
            {game.websiteUrl.replace(/^https?:\/\//, "")}
          </a>
        </p>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-200">
            Related games
          </h2>
          <ul className="flex flex-col gap-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/games/${r.slug}`}
                  className="flex items-center justify-between rounded-lg border border-neutral-800 px-4 py-3 transition hover:border-neutral-700"
                >
                  <span className="text-neutral-200">{r.name}</span>
                  <span className="text-xs text-neutral-500">
                    {formatNumber(r.voteCount)} votes
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
