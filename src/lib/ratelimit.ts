import { kv } from "@vercel/kv";

// Rate-limit por IP para /api/bid.
// - En produccion (Vercel) usa Vercel KV (@vercel/kv) para que el contador
//   persista entre instancias serverless.
// - En local, sin las env vars de KV configuradas, cae a una cola en memoria
//   (suficiente para desarrollo).

const WINDOW_SECONDS = 60;
const MAX = 6;

const memoryHits = new Map<string, number[]>();

function memoryAllowed(ip: string): boolean {
  const now = Date.now();
  const recent = (memoryHits.get(ip) ?? []).filter(
    (t) => t > now - WINDOW_SECONDS * 1000,
  );
  recent.push(now);
  memoryHits.set(ip, recent);
  return recent.length <= MAX;
}

function hasKvConfig(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function rateLimit(ip: string): Promise<boolean> {
  if (!hasKvConfig()) {
    return memoryAllowed(ip);
  }
  const key = `bid:${ip}`;
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, WINDOW_SECONDS);
  }
  return count <= MAX;
}