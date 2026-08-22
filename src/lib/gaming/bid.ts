import {
  BLOCKED_HOSTS,
  BLOCKED_TLDS,
  MAX_BID_CENTS,
  MIN_BID_CENTS,
} from "./constants";
import { cleanUrl, isValidHttps } from "./urls";

export type BidPlanOk = {
  ok: true;
  key: string;
  url: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  targetCents: number;
  payableCents: number;
  kind: "new" | "raise";
};

export type BidPlanErr = { ok: false; error: string };

export type BidPlan = BidPlanOk | BidPlanErr;

export function blockedReason(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const tld = host.split(".").pop() ?? "";
    if (BLOCKED_TLDS.includes(tld)) return "dominio no permitido";
    const blocked = BLOCKED_HOSTS.some(
      (h) => host === h || host.endsWith("." + h),
    );
    return blocked ? "dominio no permitido" : null;
  } catch {
    return null;
  }
}

export function planBid(args: {
  rawUrl: string;
  name: string;
  bidDollars: number;
  description?: string | null;
  coverUrl?: string | null;
  existingBidCents?: number | null;
}): BidPlan {
  if (!isValidHttps(args.rawUrl)) {
    return { ok: false, error: "La URL no es valida (https:// o http://)." };
  }
  const blocked = blockedReason(args.rawUrl);
  if (blocked) {
    return { ok: false, error: "Ese dominio no esta permitido en el board." };
  }

  const bidCents = args.bidDollars * 100;
  if (!Number.isInteger(bidCents) || bidCents % 100 !== 0) {
    return { ok: false, error: "La puja tiene que ser en dolares enteros." };
  }
  if (bidCents < MIN_BID_CENTS || bidCents > MAX_BID_CENTS) {
    return { ok: false, error: "La puja debe estar entre $5 y $999,999." };
  }

  const existing = args.existingBidCents ?? 0;
  if (existing > 0 && bidCents <= existing) {
    return {
      ok: false,
      error: "Debe superar tu puja actual por al menos $1.",
    };
  }

  const { key, url } = cleanUrl(args.rawUrl);
  const kind = existing > 0 ? ("raise" as const) : ("new" as const);
  return {
    ok: true,
    key,
    url,
    name: args.name.trim() || args.rawUrl,
    description: args.description?.trim() || null,
    coverUrl: args.coverUrl?.trim() || null,
    targetCents: bidCents,
    payableCents: kind === "raise" ? bidCents - existing : bidCents,
    kind,
  };
}