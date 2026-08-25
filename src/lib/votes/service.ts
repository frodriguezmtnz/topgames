import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";

export type VoteResult =
  | { ok: true; justVoted: boolean; voteCount: number }
  | { ok: false; error: "auth" | "unverified" | "not-found" | "already-voted" };

export async function voteForGame(gameId: string): Promise<VoteResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "auth" };
  }
  if (!user.emailVerifiedAt) {
    return { ok: false, error: "unverified" };
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game || game.status !== "active") {
    return { ok: false, error: "not-found" };
  }

  // Transaccion: crear el voto y subir el contador a la vez.
  // El constraint UNIQUE(user_id, game_id) hace la operacion idempotente:
  // si ya habia votado, falla y no se incrementa el contador.
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: { userId: user.id, gameId },
      });
      const updated = await tx.game.update({
        where: { id: gameId },
        data: { voteCount: { increment: 1 } },
      });
      return updated;
    });
    return { ok: true, justVoted: true, voteCount: result.voteCount };
  } catch {
    // El usuario ya habia votado: re-devolver el estado actual sin inflar el contador.
    const existing = await prisma.vote.findUnique({
      where: { userId_gameId: { userId: user.id, gameId } },
    });
    if (existing) {
      const game = await prisma.game.findUnique({ where: { id: gameId } });
      return {
        ok: true,
        justVoted: false,
        voteCount: game?.voteCount ?? 0,
      };
    }
    return { ok: false, error: "already-voted" };
  }
}