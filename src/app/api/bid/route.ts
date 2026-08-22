import { NextRequest, NextResponse } from "next/server";
import { planBid } from "@/lib/gaming/bid";
import { keyForUrl } from "@/lib/gaming/urls";
import { prisma } from "@/lib/db";
import { applyPaidOrder } from "@/lib/pay/apply";
import {
  buildSuccessUrl,
  createCheckoutUrl,
  isLemonSqueezyConfigured,
} from "@/lib/pay/lemonsqueezy";

const rateWindowMs = 60_000;
const maxAttempts = 6;
const hits = new Map<string, number[]>();

function allowed(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => t > now - rateWindowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length <= maxAttempts;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowed(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Vuelve en un minuto." },
      { status: 429 },
    );
  }

  let body: {
    url?: unknown;
    name?: unknown;
    bidDollars?: unknown;
    description?: unknown;
    coverUrl?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  const name = typeof body.name === "string" ? body.name : "";
  const bidDollars = Number(body.bidDollars);
  const description = typeof body.description === "string" ? body.description : null;
  const coverUrl = typeof body.coverUrl === "string" ? body.coverUrl : null;

  if (!Number.isFinite(bidDollars)) {
    return NextResponse.json({ error: "Puja invalida." }, { status: 400 });
  }

  const existing = rawUrl
    ? await prisma.game.findUnique({ where: { key: keyForUrl(rawUrl) } })
    : null;

  const plan = planBid({
    rawUrl,
    name,
    bidDollars,
    description,
    coverUrl,
    existingBidCents: existing?.bidCents ?? 0,
  });

  if (!plan.ok) {
    return NextResponse.json({ error: plan.error }, { status: 400 });
  }

  const custom = {
    key: plan.key,
    url: plan.url,
    name: plan.name,
    description: plan.description,
    coverUrl: plan.coverUrl,
    targetCents: String(plan.targetCents),
  };

  const mock = process.env.PAYMENT_MOCK === "1" || !isLemonSqueezyConfigured();
  if (mock) {
    const applied = await applyPaidOrder(
      "mock",
      `mock:${Date.now()}:${custom.key}`,
      custom,
    );
    if (!applied) {
      return NextResponse.json({ error: "No se pudo aplicar la puja." }, { status: 500 });
    }
    return NextResponse.json({
      mock: true,
      redirectUrl: buildSuccessUrl(plan.key),
      rankAppliedFor: applied.game.bidCents,
      orderId: applied.payment.providerPaymentId,
    });
  }

  const redirectUrl = await createCheckoutUrl({
    custom,
    description: "TopGames: una puja para poner tu juego en el ranking.",
    successUrl: buildSuccessUrl(plan.key),
  });

  return NextResponse.json({ redirectUrl });
}