import type { Game, GameProvider } from "./types";

const BASE = "https://api.rawg.io/api";
const PAGE_SIZE = 12;

function key(): string {
  const k = process.env.RAWG_API_KEY;
  if (!k) {
    throw new Error("RAWG_API_KEY no definida. Configurala en .env");
  }
  return k;
}

interface RawgListItem {
  id: number;
  name: string;
  slug: string;
  released?: string | null;
  background_image?: string | null;
  genres?: { name: string }[];
  platforms?: { platform: { name: string } }[];
}

interface RawgDetail extends RawgListItem {
  description_raw?: string | null;
  website?: string | null;
  stores?: Array<{ store: { slug: string }; url: string }>;
}

// Mapeo de store.slug de RAWG a nuestros ids de proveedor (ver lib/affiliate/providers).
const STORE_SLUG_MAP: Record<string, string> = {
  steam: "steam",
  "epic-games": "epic",
  gog: "gog",
  "playstation-store": "playstation-store",
  "xbox-store": "xbox-store",
  "nintendo-store": "nintendo-store",
  "humble-store": "humble",
  amazon: "amazon",
};

// Mapeo de store_id (endpoint /stores) a nuestros ids de proveedor.
const STORE_ID_MAP: Record<number, string> = {
  1: "steam",
  2: "xbox-store",
  3: "playstation-store",
  4: "apple-appstore",
  5: "gog",
  6: "nintendo",
  7: "xbox360",
  8: "google-play",
  9: "itch",
  11: "epic",
};

function mapList(raw: RawgListItem): Game {
  return {
    provider: "rawg",
    providerGameId: String(raw.id),
    name: raw.name,
    slug: raw.slug,
    coverUrl: raw.background_image ?? undefined,
    releasedAt: raw.released ? new Date(raw.released) : undefined,
    genres: raw.genres?.map((g) => g.name),
    platforms: raw.platforms?.map((p) => p.platform.name),
  };
}

function mapDetail(raw: RawgDetail): Game {
  return {
    ...mapList(raw),
    backgroundUrl: raw.background_image ?? undefined,
    description: raw.description_raw ?? undefined,
    websiteUrl: raw.website ?? undefined,
    stores: (raw.stores ?? [])
      .map((s) => ({
        provider: STORE_SLUG_MAP[s.store.slug] ?? s.store.slug,
        url: s.url,
      }))
      .filter((s) => Boolean(s.url)),
  };
}

export class RAWGGameProvider implements GameProvider {
  async searchGames(query: string): Promise<Game[]> {
    const url = new URL(`${BASE}/games`);
    url.searchParams.set("key", key());
    url.searchParams.set("search", query);
    url.searchParams.set("page_size", String(PAGE_SIZE));

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`RAWG search failed (${res.status})`);
    }
    const data = (await res.json()) as { results: RawgListItem[] };
    return (data.results ?? []).map(mapList);
  }

  async getGame(id: string): Promise<Game | null> {
    const url = new URL(`${BASE}/games/${id}`);
    url.searchParams.set("key", key());

    const res = await fetch(url.toString());
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`RAWG get failed (${res.status})`);
    }
    const raw = (await res.json()) as RawgDetail;
    return mapDetail(raw);
  }

  async getStores(id: string): Promise<Array<{ provider: string; url: string }>> {
    const url = new URL(`${BASE}/games/${id}/stores`);
    url.searchParams.set("key", key());

    const res = await fetch(url.toString());
    if (res.status === 404) {
      return [];
    }
    if (!res.ok) {
      throw new Error(`RAWG stores failed (${res.status})`);
    }
    // El endpoint /games/{id}/stores devuelve store_id numerico (no slug).
    const data = (await res.json()) as {
      results?: Array<{ store_id: number; url: string }>;
    };
    return (data.results ?? [])
      .map((s) => ({
        provider: STORE_ID_MAP[s.store_id] ?? `store_${s.store_id}`,
        url: s.url,
      }))
      .filter((s) => Boolean(s.url));
  }
}

export const rawgProvider = new RAWGGameProvider();
