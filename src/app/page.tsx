import Link from "next/link";
import ActivityFeed from "@/components/ActivityFeed";
import BidForm from "@/components/BidForm";
import Leaderboard from "@/components/Leaderboard";

export const metadata = {
  title: "TopGames — el leaderboard donde el puesto es la puja",
  description:
    "Puja por ser el juego #1 de la comunidad. El puesto en el ranking lo decide tu bid.",
};

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 px-5 py-12">
      <section className="text-center">
        <h1 className="text-4xl font-black tracking-tight text-neutral-50">
          topgames<span className="text-emerald-400">.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-400">
          Un leaderboard de videojuegos donde vendes algo más que likes:
          <span className="font-semibold text-neutral-200"> tu puja es tu puesto.</span>
        </p>
        <p className="mt-4 inline-block rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-1 text-xs text-neutral-500">
          Los nuevos puestos empiezan en $5. Pagar menos que el #1 igual te coloca en el
          board en el lugar que tu puja puede comprar.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Puja por tu juego
        </h2>
        <BidForm />
      </section>

      <ActivityFeed />

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-neutral-200">Leaderboard</h2>
          <span className="text-xs text-neutral-500">se refresca automáticamente</span>
        </div>
        <Leaderboard />
      </section>

      <footer className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-neutral-800 pt-6 text-xs text-neutral-500">
        <Link href="/rules" className="hover:text-neutral-300">Rules</Link>
        <Link href="/about" className="hover:text-neutral-300">About</Link>
        <span>Sin ads, sin API keys, sin revenue share.</span>
      </footer>
    </main>
  );
}