import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";

export const metadata = {
  title: "TopVideoGames — the world's community-driven game ranking",
  description:
    "Discover and vote for the best video games in the world. The community decides the ranking. Free to vote.",
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const games = await prisma.game.findMany({
    where: { status: "active" },
    orderBy: [{ voteCount: "desc" }, { createdAt: "asc" }, { id: "asc" }],
  });

  const rank = (index: number) => index + 1;
  const totalVotes = games.reduce((sum, g) => sum + g.voteCount, 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-10">
      <section className="text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-black tracking-tight text-neutral-50">
          What&apos;s the best video game{" "}
          <span className="text-emerald-500">in the world?</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-400">
          The community decides. Discover games, vote for your favourites, and help
          build the world&apos;s community-driven ranking.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-neutral-200">Worldwide ranking</h2>
          <span className="text-xs text-neutral-500">
            {formatNumber(totalVotes)} votes total
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {games.map((g, i) => (
            <li key={g.id}>
              <Link
                href={`/games/${g.slug}`}
                className="flex items-center gap-4 rounded-lg border border-neutral-800 px-4 py-3 transition hover:border-neutral-700"
              >
                <span
                  className={`w-8 text-center text-lg font-black ${
                    i === 0 ? "text-emerald-500" : "text-neutral-500"
                  }`}
                >
                  {rank(i)}
                </span>
                <span className="flex-1 truncate text-neutral-200">{g.name}</span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {formatNumber(g.voteCount)} votes
                </span>
              </Link>
            </li>
          ))}
          {games.length === 0 && (
            <li className="rounded-lg border border-dashed border-neutral-800 p-8 text-center text-sm text-neutral-500">
              No games yet. Search and import the first one!
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
