import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/auth/password";
import { isValidEmail } from "@/lib/auth/validation";
import { sendResetEmail } from "@/lib/auth/mail";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (
    !(await rateLimit(clientIp(req), {
      prefix: "forgot",
      max: 5,
      windowSeconds: 900,
    }))
  ) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

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
