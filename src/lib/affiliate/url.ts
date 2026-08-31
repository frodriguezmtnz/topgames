import { providerInfo } from "./providers";

// Aplicar el parametro de afiliado a una URL para un proveedor concreto.
// Un proveedor recibe tag SI se define AFFILIATE_TAG_<PROVIDER> (o el generico
// AFFILIATE_TAG). Esto permite usar programas de referral manuales (consolas, etc.)
// ademas de los programas con comision clasica (humble, amazon).
export function applyAffiliateTag(providerId: string, url: string): string {
  // Guard: solo proveedores conocidos entran aqui (para no taggear URLs arbitrarias).
  if (!providerInfo(providerId)) {
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