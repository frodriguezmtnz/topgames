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
    return { ok: false, error: "The URL is not valid (https:// or http://)." };
  }
  const blocked = blockedReason(args.rawUrl);
  if (blocked) {
    return { ok: false, error: "That domain is not allowed on the board." };
  }

  const bidCents = args.bidDollars * 100;
  if (!Number.isInteger(bidCents) || bidCents % 100 !== 0) {
    return { ok: false, error: "Bids must be in whole dollars." };
  }
  if (bidCents < MIN_BID_CENTS || bidCents > MAX_BID_CENTS) {
    return { ok: false, error: "Bids must be between $5 and $999,999." };
  }

  const existing = args.existingBidCents ?? 0;
  if (existing > 0 && bidCents <= existing) {
    return {
      ok: false,
      error: "You must beat your current bid by at least $1.",
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