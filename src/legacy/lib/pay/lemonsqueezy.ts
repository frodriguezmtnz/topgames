import { createHmac, timingSafeEqual } from "node:crypto";
import { APP_URL } from "@/lib/gaming/constants";
import type { BidCustomData } from "./types";

const LS_API = process.env.LEMON_API_URL ?? "https://api.lemonsqueezy.com/v1";

export function isLemonSqueezyConfigured(): boolean {
  return Boolean(
    process.env.LEMON_API_KEY &&
      process.env.LEMON_STORE_ID &&
      process.env.LEMON_VARIANT_ID,
  );
}

/**
 * Crea el checkout de un solo pago en LemonSqueezy.
 * custom_price (atributo de nivel superior) fija el importe exacto en centimos
 * sobre el variant del producto; checkout_data.custom lleva los datos del juego
 * que luego devuelve el webhook.
 */
export async function createCheckoutUrl(input: {
  custom: BidCustomData;
  description: string;
  successUrl: string;
}): Promise<string> {
  const key = process.env.LEMON_API_KEY;
  const storeId = process.env.LEMON_STORE_ID;
  const variantId = process.env.LEMON_VARIANT_ID;
  if (!key || !storeId || !variantId) {
    throw new Error("LemonSqueezy no configurado (faltan env vars).");
  }

  const res = await fetch(`${LS_API}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          custom_price: Number(input.custom.targetCents),
          product_options: {
            name: input.custom.name,
            description: input.description,
            redirect_url: input.successUrl,
          },
          checkout_data: {
            custom: {
              key: input.custom.key,
              url: input.custom.url,
              name: input.custom.name,
              ...(input.custom.description && input.custom.description.length > 0
                ? { gameDescription: input.custom.description }
                : {}),
              ...(input.custom.coverUrl && input.custom.coverUrl.length > 0
                ? { gameCover: input.custom.coverUrl }
                : {}),
              targetCents: input.custom.targetCents,
            },
          },
          expires_at: null,
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LemonSqueezy checkout error ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    data?: { attributes?: { url?: string } };
  };
  const url = json.data?.attributes?.url;
  if (!url) throw new Error("LemonSqueezy no devolvio URL de checkout.");
  return url;
}

export function buildSuccessUrl(key: string): string {
  return `${APP_URL}/success?key=${encodeURIComponent(key)}`;
}

export function verifyWebhook(secret: string, body: string, signature: string | null): boolean {
  if (!signature) return false;
  const candidates = [secret];
  const expect = (s: string) =>
    createHmac("sha256", s).update(body, "utf8").digest("hex");
  return candidates.some((s) => safeEqualHex(signature.trim(), expect(s)));
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return timingSafeEqual(ba, bb);
}