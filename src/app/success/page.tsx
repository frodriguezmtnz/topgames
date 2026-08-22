import Link from "next/link";

export const metadata = { title: "Pago completado" };

export default async function SuccessPage(props: {
  searchParams: Promise<{ key?: string; mocked?: string }>;
}) {
  const { key, mocked } = await props.searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Pago recibido</h1>
      <p className="text-sm text-neutral-500">
        Tu juego ya está en el ranking.
      </p>
      {mocked === "1" && (
        <p className="text-xs text-amber-500">
          (modo demo: sin cargo real, pago simulado en local)
        </p>
      )}
      <Link
        href={`/${key ? `?game=${encodeURIComponent(key)}` : ""}`}
        className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm"
      >
        Ver ranking
      </Link>
    </main>
  );
}