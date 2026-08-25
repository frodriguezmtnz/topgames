import Link from "next/link";

export const metadata = { title: "Payment canceled" };

export default function CanceledPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">You canceled the payment</h1>
      <p className="text-sm text-neutral-500">
        Nothing was changed in the ranking.
      </p>
      <Link
        href="/"
        className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm"
      >
        Back
      </Link>
    </main>
  );
}