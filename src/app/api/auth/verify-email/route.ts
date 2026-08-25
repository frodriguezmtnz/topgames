import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/auth/password";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = body.token ?? "";
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const tokenHash = sha256(token);

  const user = await prisma.user.findFirst({
    where: { emailTokenHash: tokenHash },
  });
  if (!user || !user.emailTokenExpiresAt || user.emailTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
  if (user.emailVerifiedAt) {
    return NextResponse.json({ message: "Email already verified" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      emailTokenHash: null,
      emailTokenExpiresAt: null,
    },
  });

  return NextResponse.json({ message: "Email verified" });
}
