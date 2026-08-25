import { createHmac, timingSafeEqual } from "node:crypto";

// Firma del token de exito del pago.
// El token se genera al crear el checkout y evita que /success pueda consultarse
// sin haber pasado por el pago (un usuario no puede forzar "pago completado").

const secret = () => process.env.LEMON_WEBHOOK_SECRET || process.env.APP_URL || "topgames";

export function signSuccessToken(key: string): string {
  const payload = `${key}:${Date.now()}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}_${sig}`;
}

export function verifySuccessToken(token: string | undefined, key: string): boolean {
  if (!token) return false;
  const parts = token.split("_");
  if (parts.length !== 2) return false;
  const payload = parts[0];
  // El payload contiene `${key}:<ts>`. Lo verificamos por HMAC completo:
  // recomputamos la firma sobre el payload recibido (no permitimos otros keys).
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  const expected = Buffer.from(sig, "hex");
  const given = Buffer.from(parts[1], "hex");
  if (expected.length !== given.length) return false;
  const ok = timingSafeEqual(expected, given);
  if (!ok) return false;
  // El payload debe empezar por el key esperado (evita tokens de otros juegos)
  if (!payload.startsWith(`${key}:`)) return false;
  // 30 min de validez
  const ts = Number(payload.split(":")[1]);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < 30 * 60 * 1000;
}