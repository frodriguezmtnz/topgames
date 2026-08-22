import { describe, expect, it } from "vitest";
import { blockedReason, planBid } from "@/lib/gaming/bid";
import { keyForUrl } from "@/lib/gaming/urls";

describe("planBid", () => {
  const base = {
    rawUrl: "https://mijuego.com",
    name: "Mi Juego",
    bidDollars: 100,
  };

  it("acepta una puja nueva valida (target == payable)", () => {
    const p = planBid(base);
    expect(p).toMatchObject({ ok: true });
    if (p.ok) {
      expect(p.kind).toBe("new");
      expect(p.targetCents).toBe(10000);
      expect(p.payableCents).toBe(10000);
      expect(p.key).toBe("mijuego.com");
    }
  });

  it("rechaza importes no enteros", () => {
    const p = planBid({ ...base, bidDollars: 50.5 });
    expect(p.ok).toBe(false);
  });

  it("rechaza pujas fuera de rango", () => {
    expect(planBid({ ...base, bidDollars: 3 }).ok).toBe(false);
    expect(planBid({ ...base, bidDollars: 1000000 }).ok).toBe(false);
  });

  it("rechaza dominios bloqueados (chats)", () => {
    const p = planBid({ ...base, rawUrl: "https://discord.gg/abc" });
    expect(p.ok).toBe(false);
    const p2 = planBid({ ...base, rawUrl: "https://t.me/canal" });
    expect(p2.ok).toBe(false);
  });

  it("una subida solo cobra la diferencia", () => {
    const p = planBid({
      ...base,
      bidDollars: 300,
      existingBidCents: 10000,
    });
    expect(p).toMatchObject({ ok: true });
    if (p.ok) {
      expect(p.kind).toBe("raise");
      expect(p.targetCents).toBe(30000);
      expect(p.payableCents).toBe(20000);
    }
  });

  it("rechaza bajar o igualar la propia puja", () => {
    const p = planBid({
      ...base,
      bidDollars: 100,
      existingBidCents: 10000,
    });
    expect(p.ok).toBe(false);
  });
});

describe("keyForUrl", () => {
  it("normaliza host, path y quita query/slash", () => {
    expect(keyForUrl("HTTPS://WWW.Store.SteamPowered.com/App/123/?x=1")).toBe(
      "store.steampowered.com/app/123",
    );
  });

  it("distingue rutas distintas (mismos host, juegos distintos)", () => {
    expect(keyForUrl("https://store.steampowered.com/app/1")).not.toBe(
      keyForUrl("https://store.steampowered.com/app/2"),
    );
  });
});

describe("blockedReason (moderacion + anti-SSRF)", () => {
  it("permite un juego normal de Steam", () => {
    expect(blockedReason("https://store.steampowered.com/app/123/Game/")).toBeNull();
  });

  it("bloquea chats (Discord, Telegram, WhatsApp)", () => {
    expect(blockedReason("https://discord.gg/abc")).toBe("blocked");
    expect(blockedReason("https://t.me/canal")).toBe("blocked");
    expect(blockedReason("https://wa.me/342")).toBe("blocked");
  });

  it("bloquea dominios adultos", () => {
    expect(blockedReason("https://onlyfans.com/user")).toBe("blocked");
    expect(blockedReason("https://xhamster.com/x")).toBe("blocked");
  });

  it("bloquea shorteners", () => {
    expect(blockedReason("https://bit.ly/abc")).toBe("shortener");
    expect(blockedReason("https://t.co/game")).toBe("shortener");
  });

  it("bloquea IPs reservadas / localhost (anti-SSRF)", () => {
    expect(blockedReason("http://localhost:3000/x")).toBe("blocked");
    expect(blockedReason("http://127.0.0.1/admin")).toBe("blocked");
    expect(blockedReason("http://169.254.169.254/latest/meta-data")).toBe("blocked");
    expect(blockedReason("http://10.0.0.1/x")).toBe("blocked");
  });

  it("bloquea .onion", () => {
    expect(blockedReason("https://x.onion/y")).toBe("blocked");
  });

  it("bloquea keywords NSFW en el host", () => {
    expect(blockedReason("https://pornhub.tv")).toBe("nsfw");
  });
});