import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { rawgProvider } from "@/lib/games/rawg";
import { formatNumber } from "@/lib/format";
import VoteButton from "@/components/VoteButton";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

async function loadGame(slug: string) {
  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game || game.status !== "active") {
    return null;
  }

  // Enriquecer una sola vez (primera vista) si falta el detalle de RAWG,
  // para no consultar RAWG en cada page view.
  if (game.provider === "rawg" && !game.description) {
    try {
      const detail = await rawgProvider.getGame(game.providerGameId);
      if (detail) {
        await prisma.game.update({
          where: { id: game.id },
          data: {
            description: detail.description ?? game.description,
            websiteUrl: detail.websiteUrl ?? game.websiteUrl,
            backgroundUrl: detail.backgroundUrl ?? game.backgroundUrl,
          },
        });
        return prisma.game.findUnique({ where: { id: game.id } });
      }
    } catch {
      // si RAWG falla, servimos lo que tengamos en local
    }
  }
  return game;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await loadGame(slug);
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

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = await loadGame(slug);
  if (!game) {
    notFound();
  }

  const rank = await rankOf(game.voteCount);

  const related = await prisma.game.findMany({
    where: {
      status: "active",
      id: { not: game.id },
      genres: { hasSome: game.genres },
    },
    orderBy: { voteCount: "desc" },
    take: 6,
  });

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
