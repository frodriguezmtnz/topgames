import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, sha256 } from "@/lib/auth/password";
import { isStrongPassword } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = body.token ?? "";
  const password = body.password ?? "";

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }
  if (!isStrongPassword(password)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const tokenHash = sha256(token);
  const user = await prisma.user.findFirst({
    where: { resetTokenHash: tokenHash },
  });
  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({ message: "Password updated. Please log in." });
}
