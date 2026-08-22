import { NextRequest, NextResponse } from "next/server";
import { applyPaidOrder } from "@/lib/pay/apply";
import { verifyWebhook } from "@/lib/pay/lemonsqueezy";
import type { BidCustomData } from "@/lib/pay/types";

export const runtime = "nodejs";

function extractCustom(attributes: Record<string, unknown> | undefined): BidCustomData | null {
  const candidates = [
    attributes?.meta_data,
    attributes?.custom_meta,
    attributes?.custom,
    attributes?.checkout_data,
  ] as unknown[];

  for (const c of candidates) {
    if (c && typeof c === "object" && !Array.isArray(c)) {
      const obj = c as Record<string, unknown>;
      if (
        typeof obj.key === "string" &&
        typeof obj.url === "string" &&
        typeof obj.name === "string" &&
        typeof obj.targetCents === "number"
      ) {
        return {
          key: obj.key,
          url: obj.url,
          name: obj.name,
          description:
            typeof obj.description === "string" ? obj.description : null,
          coverUrl: typeof obj.coverUrl === "string" ? obj.coverUrl : null,
          targetCents: obj.targetCents,
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
      return NextResponse.json({ error: "Webhook secret no configurado." }, { status: 500 });
    }
    if (!verifyWebhook(secret, raw, sig)) {
      return NextResponse.json({ error: "Firma invalida." }, { status: 401 });
    }
  }

  let payload: {
    data?: { id?: string | number; attributes?: Record<string, unknown> };
    meta?: { event_name?: string };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
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
  return NextResponse.json({ ok: true, applied: applied.payment.kind });
}