import { prisma } from "@/lib/db";
import type { BidCustomData } from "./types";

/**
 * Aplica un pago confirmado sobre el ranking.
 * - El montante del ranking es el targetCents (lo que el usuario pidio).
 * - Nunca baja la puja: newBid = max(actual, target).
 * - Idempotente: un mismo providerPaymentId solo se registra una vez.
 */
export async function applyPaidOrder(provider: string, providerPaymentId: string, custom: BidCustomData) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.game.findUnique({ where: { key: custom.key } });
    const newBid = Math.max(existing?.bidCents ?? 0, custom.targetCents);

    const game = await tx.game.upsert({
      where: { key: custom.key },
      update: {
        bidCents: newBid,
        url: custom.url,
        name: custom.name,
        description: custom.description,
        coverUrl: custom.coverUrl,
      },
      create: {
        key: custom.key,
        url: custom.url,
        name: custom.name,
        description: custom.description,
        coverUrl: custom.coverUrl,
        bidCents: custom.targetCents,
      },
    });

    const payment = await tx.payment.upsert({
      where: { providerPaymentId },
      update: {},
      create: {
        provider,
        providerPaymentId,
        gameId: game.id,
        kind: existing ? "raise" : "new",
        amountCents: custom.targetCents,
        status: "paid",
      },
    });

    return { game, payment };
  });
}