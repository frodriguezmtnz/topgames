import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/auth/password";
import { isValidEmail } from "@/lib/auth/validation";
import { sendResetEmail } from "@/lib/auth/mail";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Siempre respondemos lo mismo para no revelar si el email existe.
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const rawToken = randomToken(32);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: sha256(rawToken),
        resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendResetEmail(email, rawToken);
  }

  return NextResponse.json({
    message: "If that email exists, a reset link has been sent.",
  });
}
