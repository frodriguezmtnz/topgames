import { Redis } from "@upstash/redis";

// Rate-limit por IP, reutilizable por endpoint (prefijo + ventana + max).
// - En produccion (Vercel) usa Upstash Redis (@upstash/redis) a traves de las
//   env vars auto-inyectadas por la integracion (KV_REST_API_URL / KV_REST_API_TOKEN).
// - En local, sin esas variables, cae a una cola en memoria (suficiente para dev).

export interface RateLimitOptions {
  prefix: string;
  max: number;
  windowSeconds: number;
}

const memory = new Map<string, number[]>();

function memoryAllowed(key: string, opts: RateLimitOptions): boolean {
  const now = Date.now();
  const recent = (memory.get(key) ?? []).filter(
    (t) => t > now - opts.windowSeconds * 1000,
  );
  recent.push(now);
  memory.set(key, recent);
  return recent.length <= opts.max;
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

export async function rateLimit(
  ip: string,
  opts: RateLimitOptions,
): Promise<boolean> {
  const redis = getRedis();
  const memKey = `${opts.prefix}:${ip}`;
  if (!redis) {
    return memoryAllowed(memKey, opts);
  }
  const key = `${opts.prefix}:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, opts.windowSeconds);
  }
  return count <= opts.max;
}