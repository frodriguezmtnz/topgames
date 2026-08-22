import Link from "next/link";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <nav className="text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-200">topgames</Link>
        <span className="mx-2 text-neutral-700">·</span>
        <Link href="/rules" className="hover:text-neutral-200">Rules</Link>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">About</h1>

      <p className="text-neutral-300">
        TopGames arrancó como un side project: sin ads, sin API keys, sin revenue share.
        Solo pujar para superar a tus competidores y ser el #1 — así de simple.
      </p>

      <p className="text-neutral-400">
        Cada fila del leaderboard es un videojuego. Puedes pujar por tu propio juego
        (Steam, itch.io, tu web, lo que sea) o por cualquiera que quieras ver arriba.
        Cuanto más pagues, más arriba estará. El ranking es la puja, nada más.
      </p>

      <p className="text-neutral-400">
        El proyecto sigue vivo bajo las mismas reglas. Mismo tablero, misma idea.
        El puesto es la puja — nada más.
      </p>

      <footer className="mt-6 text-xs text-neutral-600">
        Built as a playful leaderboard for gamers & indie devs. ·{" "}
        <Link href="/rules" className="hover:text-neutral-300">ver reglas</Link>
      </footer>
    </main>
  );
}