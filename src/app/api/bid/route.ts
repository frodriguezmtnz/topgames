import { NextRequest, NextResponse } from "next/server";
import { planBid } from "@/lib/gaming/bid";
import { keyForUrl } from "@/lib/gaming/urls";
import { prisma } from "@/lib/db";
import { applyPaidOrder } from "@/lib/pay/apply";
import { signSuccessToken } from "@/lib/pay/successToken";
import { rateLimit } from "@/lib/ratelimit";
import {
  buildSuccessUrl,
  createCheckoutUrl,
  isLemonSqueezyConfigured,
} from "@/lib/pay/lemonsqueezy";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await rateLimit(ip))) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
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
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  const name = typeof body.name === "string" ? body.name : "";
  const bidDollars = Number(body.bidDollars);
  const description = typeof body.description === "string" ? body.description : null;
  const coverUrl = typeof body.coverUrl === "string" ? body.coverUrl : null;

  if (!Number.isFinite(bidDollars)) {
    return NextResponse.json({ error: "Invalid bid." }, { status: 400 });
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

  // successToken valida la autenticidad del pago: solo la URL generada tras el
  // checkout (firmada por el servidor) puede mostrar el exito. Evita falsos /success.
  const successUrl = `${buildSuccessUrl(plan.key)}&t=${signSuccessToken(plan.key)}`;

  // El modo mock NUNCA se activa en produccion: un fallo de config no debe
  // permitir pujar gratis. En prod solo se permite el checkout real.
  const mock =
    process.env.NODE_ENV !== "production" &&
    (process.env.PAYMENT_MOCK === "1" || !isLemonSqueezyConfigured());
  if (mock) {
    const applied = await applyPaidOrder(
      "mock",
      `mock:${Date.now()}:${custom.key}`,
      custom,
    );
    if (!applied) {
      return NextResponse.json({ error: "Could not apply your bid." }, { status: 500 });
    }
    return NextResponse.json({
      mock: true,
      redirectUrl: successUrl,
      rankAppliedFor: applied.game.bidCents,
      orderId: applied.payment.providerPaymentId,
    });
  }

  let redirectUrl: string;
  try {
    redirectUrl = await createCheckoutUrl({
      custom,
      description: "topvideogames.lol: a bid to put your game on the leaderboard.",
      successUrl,
    });
  } catch (err) {
    console.error("createCheckoutUrl", err);
    return NextResponse.json(
      { error: "Could not create the payment. Check payment settings." },
      { status: 502 },
    );
  }

  return NextResponse.json({ redirectUrl });
}
