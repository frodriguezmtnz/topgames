import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 py-14">
      <h1 className="text-2xl font-black text-neutral-50">Create account</h1>
      <p className="text-sm text-neutral-500">
        Verify your email to start voting for your favourite games.
      </p>
      <AuthForm mode="register" />
      <p className="text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-neutral-300 underline hover:text-neutral-100">
          Log in
        </Link>
      </p>
    </main>
  );
}