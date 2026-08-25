import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ voted: false });
  }

  const vote = await prisma.vote.findUnique({
    where: { userId_gameId: { userId: user.id, gameId: id } },
    select: { id: true, createdAt: true },
  });

  return NextResponse.json({ voted: Boolean(vote) });
}
