import Link from "next/link";

export const metadata = { title: "Pago cancelado" };

export default function CanceledPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Has cancelado el pago</h1>
      <p className="text-sm text-neutral-500">
        No se ha aplicado ningún cambio en el ranking.
      </p>
      <Link
        href="/"
        className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm"
      >
        Volver
      </Link>
    </main>
  );
}