import { prisma } from "@/lib/db";
import { applyAffiliateTag } from "./url";

// Registrar un click de salida y devolver la URL final (con tag de afiliado si aplica).
export async function buildOutUrl(data: {
  providerId: string;
  storeUrl: string;
  gameId: string;
  userId?: string | null;
  referrer?: string | null;
}): Promise<{ url: string; provider: string }> {
  const target = applyAffiliateTag(data.providerId, data.storeUrl);

  // Fire-and-forget: no bloquear el redirect por un fallo de registro.
  void prisma.affiliateClick
    .create({
      data: {
        gameId: data.gameId,
        provider: data.providerId,
        userId: data.userId ?? null,
        referrer: data.referrer ?? null,
      },
    })
    .catch(() => {});

  return { url: target, provider: data.providerId };
}