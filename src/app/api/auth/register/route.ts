import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, randomToken, sha256 } from "@/lib/auth/password";
import { isValidEmail, isStrongPassword } from "@/lib/auth/validation";
import { sendVerificationEmail } from "@/lib/auth/mail";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!isStrongPassword(password)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // No revelar si el email ya existe.
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const rawToken = randomToken(32);
  const emailTokenHash = sha256(rawToken);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailTokenHash,
      emailTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // El enlace lleva el token crudo; solo su hash se guarda en BD.
  await sendVerificationEmail(email, rawToken);

  return NextResponse.json(
    { message: "Registered. Check your email to verify your account." },
    { status: 201 },
  );
}
