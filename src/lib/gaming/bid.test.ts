import { describe, expect, it } from "vitest";
import { planBid } from "@/lib/gaming/bid";
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