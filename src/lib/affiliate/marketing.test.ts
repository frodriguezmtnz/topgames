import { describe, it, expect, afterEach } from "vitest";
import { providerInfo, AFFILIATE_PROVIDERS } from "./providers";
import { applyAffiliateTag } from "./url";

describe("affiliate providers", () => {
  it("knows Steam as direct (no commission) and Humble/Amazon as affiliate", () => {
    expect(providerInfo("steam")?.hasAffiliate).toBe(false);
    expect(providerInfo("humble")?.hasAffiliate).toBe(true);
    expect(providerInfo("amazon")?.hasAffiliate).toBe(true);
  });

  it("returns null for unknown provider", () => {
    expect(providerInfo("nope")).toBeNull();
  });

  it("exposes stable provider id list", () => {
    expect(AFFILIATE_PROVIDERS["playstation-store"]).toBeTruthy();
    expect(AFFILIATE_PROVIDERS["xbox-store"]).toBeTruthy();
  });
});

describe("applyAffiliateTag", () => {
  const OLD = process.env.AFFILIATE_TAG_HUMBLE;

  afterEach(() => {
    if (OLD === undefined) delete process.env.AFFILIATE_TAG_HUMBLE;
    else process.env.AFFILIATE_TAG_HUMBLE = OLD;
  });

  it("adds tag to an affiliate URL when the tag env is set", () => {
    process.env.AFFILIATE_TAG_HUMBLE = "mysite-20";
    const tagged = applyAffiliateTag("humble", "https://humblebundle.com/game/x");
    expect(tagged).toContain("tag=mysite-20");
  });

  it("does not tag a provider without an affiliate program", () => {
    process.env.AFFILIATE_TAG_HUMBLE = "mysite-20";
    const url = "https://store.steampowered.com/app/220";
    expect(applyAffiliateTag("steam", url)).toBe(url);
  });

  it("returns the original URL when no tag is configured", () => {
    delete process.env.AFFILIATE_TAG_HUMBLE;
    const url = "https://humblebundle.com/game/x";
    expect(applyAffiliateTag("humble", url)).toBe(url);
  });

  it("preserves existing query params when tagging", () => {
    process.env.AFFILIATE_TAG = "site-1";
    const url = "https://www.amazon.com/dp/B0TEST?a=b";
    const tagged = applyAffiliateTag("amazon", url);
    expect(tagged).toContain("a=b");
    expect(tagged).toContain("tag=site-1");
  });
});