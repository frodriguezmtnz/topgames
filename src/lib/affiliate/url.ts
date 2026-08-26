import { providerInfo } from "./providers";

// Aplicar el parametro de afiliado a una URL cuando el proveedor tiene programa.
// Los tags se leen de env para evitar hardcodear keys de afiliado.
export function applyAffiliateTag(providerId: string, url: string): string {
  const info = providerInfo(providerId);
  if (!info?.hasAffiliate) {
    return url;
  }

  const tag =
    process.env[`AFFILIATE_TAG_${providerId.toUpperCase().replace(/-/g, "_")}`] ??
    process.env.AFFILIATE_TAG;
  if (!tag) {
    return url;
  }

  try {
    const u = new URL(url);
    u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    return url;
  }
}