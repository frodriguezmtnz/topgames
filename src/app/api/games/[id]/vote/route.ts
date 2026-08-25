import { NextRequest, NextResponse } from "next/server";
import { voteForGame } from "@/lib/votes/service";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/http";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Props) {
  const { id } = await params;

  if (!(await rateLimit(clientIp(req), { prefix: "vote", max: 20, windowSeconds: 60 }))) {
    return NextResponse.json({ error: "Too many votes. Slow down." }, { status: 429 });
  }

  const result = await voteForGame(id);
  if (!result.ok) {
    const status =
      result.error === "auth"
        ? 401
        : result.error === "unverified"
          ? 403
          : result.error === "not-found"
            ? 404
            : 409;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    voted: true,
    alreadyVoted: !result.justVoted,
    voteCount: result.voteCount,
  });
}