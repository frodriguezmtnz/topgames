import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * /api/r/[key] cuenta un click sobre el juego y redirige a su URL.
 * Asi el board puede mostrar "visits" reales, como outbid.lol.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/r/[key]">) {
  const { key } = await ctx.params;
  const game = await prisma.game.findUnique({ where: { key } });
  if (!game) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await prisma.game.update({
    where: { id: game.id },
    data: { clicks: { increment: 1 }, lastClickAt: new Date() },
  });

  return NextResponse.redirect(game.url, { status: 302 });
}