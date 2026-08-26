import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { providerInfo } from "@/lib/affiliate/providers";
import { buildOutUrl } from "@/lib/affiliate/marketing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ provider: string; slug: string }> };

export async function GET(req: NextRequest, { params }: Props) {
  const { provider, slug } = await params;

  const info = providerInfo(provider);
  if (!info) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game || game.status !== "active") {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const storeLink = await prisma.storeLink.findUnique({
    where: { gameId_provider: { gameId: game.id, provider } },
  });
  if (!storeLink) {
    return NextResponse.json(
      { error: "No store link for this game" },
      { status: 404 },
    );
  }

  const user = await getSessionUser();
  const referrer = req.headers.get("referer");

  const { url } = await buildOutUrl({
    providerId: provider,
    storeUrl: storeLink.url,
    gameId: game.id,
    userId: user?.id,
    referrer,
  });

  return NextResponse.redirect(url, 302);
}