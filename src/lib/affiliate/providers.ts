// Configuracion de tiendas / afiliados para la ficha de juego y el redirect /out/.
// La monetizacion esta separada de la integridad del ranking.

export interface AffiliateProvider {
  id: string;
  label: string;
  // true = anadir el tag de afiliado a la URL (programa con comision).
  hasAffiliate: boolean;
}

// Primeros stores: Steam sin comision (RAWG lo da), Humble/Amazon con comision real.
// El resto se anade segun vayamos confirmando programas.
export const AFFILIATE_PROVIDERS: Record<string, AffiliateProvider> = {
  steam: { id: "steam", label: "Steam", hasAffiliate: false },
  humble: { id: "humble", label: "Humble Store", hasAffiliate: true },
  amazon: { id: "amazon", label: "Amazon", hasAffiliate: true },
  epic: { id: "epic", label: "Epic Games", hasAffiliate: false },
  gog: { id: "gog", label: "GOG", hasAffiliate: false },
  "playstation-store": { id: "playstation-store", label: "PlayStation", hasAffiliate: false },
  "xbox-store": { id: "xbox-store", label: "Xbox", hasAffiliate: false },
  "nintendo-store": { id: "nintendo-store", label: "Nintendo", hasAffiliate: false },
};

export function providerInfo(id: string): AffiliateProvider | null {
  return AFFILIATE_PROVIDERS[id] ?? null;
}