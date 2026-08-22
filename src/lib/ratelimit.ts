import { Redis } from "@upstash/redis";

// Rate-limit por IP para /api/bid.
// - En produccion (Vercel) usa Upstash Redis (@upstash/redis) a traves de las
//   env vars auto-inyectadas por la integracion (KV_REST_API_URL / KV_REST_API_TOKEN).
// - En local, sin esas variables, cae a una cola en memoria (suficiente para dev).

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

function hasUpstashConfig(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getRedis(): Redis | null {
  if (!hasUpstashConfig()) {
    return null;
  }
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return null;
  }
  return new Redis({ url, token });
}

export async function rateLimit(ip: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    return memoryAllowed(ip);
  }
  const key = `bid:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  return count <= MAX;
}