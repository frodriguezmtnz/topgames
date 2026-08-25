import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 py-14">
      <h1 className="text-2xl font-black text-neutral-50">Log in</h1>
      <AuthForm mode="login" next={next} />
      <p className="text-sm text-neutral-500">
        No account?{" "}
        <Link href="/register" className="text-neutral-300 underline hover:text-neutral-100">
          Create one
        </Link>{" "}
        ·{" "}
        <Link href="/forgot-password" className="text-neutral-300 underline hover:text-neutral-100">
          Forgot password?
        </Link>
      </p>
    </main>
  );
}
