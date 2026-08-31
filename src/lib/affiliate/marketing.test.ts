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
  const SAVED: Record<string, string | undefined> = {
    AFFILIATE_TAG_HUMBLE: process.env.AFFILIATE_TAG_HUMBLE,
    AFFILIATE_TAG_XBOX_STORE: process.env.AFFILIATE_TAG_XBOX_STORE,
    AFFILIATE_TAG: process.env.AFFILIATE_TAG,
  };

  afterEach(() => {
    for (const [k, v] of Object.entries(SAVED)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("adds tag to an affiliate URL when the tag env is set", () => {
    process.env.AFFILIATE_TAG_HUMBLE = "mysite-20";
    const tagged = applyAffiliateTag("humble", "https://humblebundle.com/game/x");
    expect(tagged).toContain("tag=mysite-20");
  });

  it("does not tag an unknown provider even with a generic tag", () => {
    process.env.AFFILIATE_TAG = "site-1";
    const url = "https://weirdstore.example/game";
    expect(applyAffiliateTag("unknown-store", url)).toBe(url);
  });

  it("tags a provider without an affiliate program when a specific tag is set", () => {
    process.env.AFFILIATE_TAG_XBOX_STORE = "site-xbox";
    const url = "https://www.microsoft.com/en-us/p/game";
    expect(applyAffiliateTag("xbox-store", url)).toContain("tag=site-xbox");
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