import Link from "next/link";

export const metadata = { title: "Rules" };

export default function RulesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <nav className="text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-200">topgames</Link>
        <span className="mx-2 text-neutral-700">·</span>
        <Link href="/about" className="hover:text-neutral-200">About</Link>
      </nav>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rules</h1>
        <p className="mt-2 text-neutral-400">
          TopGames es un leaderboard público. No hay ads, ni API keys, ni revenue share.
          Pagas para estar por encima de los demás. El puesto es la puja — nada más.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">Cómo funciona el ranking</h2>
          <ul className="list-inside list-disc space-y-2 text-neutral-400">
            <li>
              Nuevas entradas en dólares enteros, mínimo $5, máximo $999,999. Las pujas ya en
              el board mantienen su importe hasta que suben o las superan.
            </li>
            <li>
              Quitar el #1 cuesta al menos $5 más que la puja top actual. Pagar menos igual
              te coloca en el board en el lugar que tu bid pueda comprar.
            </li>
            <li>
              Pujas empatadas se ordenan por antigüedad: la puja más vieja queda más arriba.
            </li>
            <li>
              Entrar la misma URL de nuevo sirve para subir de puesto; solo pagas la diferencia,
              y nadie puede quitarte el puesto pagando esa diferencia.
            </li>
            <li>
              Links de Steam, itch.io y similares se identifican por su ruta, así que juegos
              distintos no comparten puja. Los query params de tracking se ignoran.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">Qué puedes listar</h2>
          <ul className="list-inside list-disc space-y-2 text-neutral-400">
            <li>Un juego en Steam, Game Pass, itch.io, tu web o cualquier página de juego.</li>
            <li>
              Links de invitación a chats no se permiten — Discord, WhatsApp, Telegram, etc.
            </li>
            <li>Nada de contenido sexual/NSFW. Si es porn o plataforma adulta, no va en el board.</li>
            <li>Los parámetros de consulta se quitan de los links de listado.</li>
            <li>Link shorteners no están permitidos; se reemplazan por su destino final.</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">Después de pagar</h2>
          <ul className="list-inside list-disc space-y-2 text-neutral-400">
            <li>Tu juego es público y los clicks van a la URL que enviaste, sin query params.</li>
            <li>Un pago completado es lo que reclama el puesto.</li>
          </ul>
        </div>
      </section>

      <footer className="text-xs text-neutral-600">
        <Link href="/" className="hover:text-neutral-300">← volver al ranking</Link>
      </footer>
    </main>
  );
}