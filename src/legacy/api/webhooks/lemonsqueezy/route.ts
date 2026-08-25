import { NextRequest, NextResponse } from "next/server";
import { applyPaidOrder } from "@/lib/pay/apply";
import { verifyWebhook } from "@/lib/pay/lemonsqueezy";
import type { BidCustomData } from "@/lib/pay/types";

export const runtime = "nodejs";

function extractCustom(attributes: Record<string, unknown> | undefined): BidCustomData | null {
  const firstOrderItem = attributes?.first_order_item;
  const itemAttrs =
    firstOrderItem && typeof firstOrderItem === "object"
      ? (firstOrderItem as Record<string, unknown>)
      : {};

  const candidateContainers = [
    attributes?.custom,
    attributes?.checkout_data,
    attributes?.meta_data,
    attributes?.custom_meta,
    itemAttrs.custom,
    itemAttrs.checkout_data,
    itemAttrs.meta_data,
  ] as unknown[];

  for (const c of candidateContainers) {
    if (c && typeof c === "object" && !Array.isArray(c)) {
      const obj = c as Record<string, unknown>;
      // Le desanida tanto el custom directo como checkout_data.custom
      const inner = (typeof obj.custom === "object" && obj.custom !== null
        ? (obj.custom as Record<string, unknown>)
        : obj) as Record<string, unknown>;
      const rawTarget = inner.key && inner.url && inner.name
        ? (inner.targetCents as unknown)
        : null;
      if (
        typeof inner.key === "string" &&
        typeof inner.url === "string" &&
        typeof inner.name === "string" &&
        (typeof rawTarget === "string" || typeof rawTarget === "number")
      ) {
        return {
          key: inner.key,
          url: inner.url,
          name: inner.name,
          description:
            typeof inner.gameDescription === "string" ? inner.gameDescription : null,
          coverUrl: typeof inner.gameCover === "string" ? inner.gameCover : null,
          targetCents: String(rawTarget),
        };
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = process.env.LEMON_WEBHOOK_SECRET ?? "";
  const mock = process.env.PAYMENT_MOCK === "1" && process.env.NODE_ENV !== "production";

  if (!mock) {
    const sig = req.headers.get("x-signature");
    if (!secret) {
      return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
    }
    if (!verifyWebhook(secret, raw, sig)) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
  }

  let payload: {
    data?: { id?: string | number; attributes?: Record<string, unknown> };
    meta?: { event_name?: string };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? "";
  const data = payload.data;
  if (!data || !data.id) {
    return NextResponse.json({ ok: true, note: "sin data" });
  }

  if (eventName !== "order_created" && eventName !== "order_paid") {
    return NextResponse.json({ ok: true, ignored: eventName });
  }

  const custom = extractCustom(data.attributes);
  if (!custom) {
    return NextResponse.json({ ok: true, note: "order sin custom data" });
  }

  const providerPaymentId = `lemonsqueezy:${data.id}`;
  const applied = await applyPaidOrder("lemonsqueezy", providerPaymentId, custom);
  if (!applied) {
    return NextResponse.json({ ok: true, note: "order sin importe valido" });
  }
  return NextResponse.json({ ok: true, applied: applied.payment.kind });
}